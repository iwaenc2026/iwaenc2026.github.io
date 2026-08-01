let allIndustry = [];
const allKeys = {
    session: [],
}
const filters = {
    session: null,
};

let uniqueSessions = [];
const sponsorTierOrder = ['Golden', 'Silver', 'Bronze', 'Technical Co-Sponsor', 'Patron'];

const updateCards = (papers) => {

    const all_mounted_cards = d3.select('.industry-cards')
      .selectAll('.myCard', openreview => openreview.uid)
      .data(papers, d => d.number)
      .join('div')
      .attr('class', 'myCard col-12 col-sm-6 col-md-4')
      .html(card_html)

    lazyLoader();
}

const render = () => {
    const f_test = [];

    updateSession();

    Object.keys(filters)
      .forEach(k => {filters[k] ? f_test.push([k, filters[k]]) : null})

    if (f_test.length === 0) updateCards(allIndustry)
    else {
        const fList = allIndustry.filter(
          d => {
              let i = 0, pass_test = true;
              while (i < f_test.length && pass_test) {
                  pass_test &= String(d[f_test[i][0]] || '').indexOf(f_test[i][1]) > -1
                  i++;
              }
              return pass_test;
          });
        updateCards(fList)
    }
}


const start = () => {
    const urlFilter = getUrlParameter("session");

    d3.json('industry.json').then(industry => {
        allIndustry = industry;
        calcAllKeysSimple(allIndustry, allKeys);
        uniqueSessions = [...new Set(allKeys['session'])];
        uniqueSessions = uniqueSessions.filter(Boolean).sort((a, b) => {
            const tierA = sponsorTierOrder.indexOf(a);
            const tierB = sponsorTierOrder.indexOf(b);
            if (tierA === -1 && tierB === -1) return a.localeCompare(b);
            if (tierA === -1) return 1;
            if (tierB === -1) return -1;
            return tierA - tierB;
        });
        renderFilters(uniqueSessions);
        updateFilterSelectionBtn(urlFilter);
        render();

    }).catch(e => console.error(e))
}

const sponsorLabel = value => {
    if (!value) return 'All Sponsors';
    if (value === 'Technical Co-Sponsor') return 'Technical Co-Sponsors';
    if (value === 'Patron') return 'Patrons';
    return `${value} Sponsors`;
};

const renderFilters = sessions => {
    const options = ['', ...sessions];
    const labels = d3.select('.filter_option')
      .selectAll('label')
      .data(options)
      .join('label')
      .attr('class', 'btn btn-outline-secondary')
      .attr('data-tippy-content', sponsorLabel)
      .text(sponsorLabel);

    labels.append('input')
      .attr('type', 'radio')
      .attr('name', 'options')
      .attr('value', d => d)
      .attr('autocomplete', 'off');

    labels.on('click', function (session) {
        setQueryStringParameter("session", session);
        updateFilterSelectionBtn(session);
        render();
    });
}

const updateFilterSelectionBtn = value => {
    d3.selectAll('.filter_option label')
      .classed('active', function () {
          const v = d3.select(this).select('input').property('value')
          return v === value;
      })
    // sessionSearch();
}

const updateSession = () => {
    const urlSession = getUrlParameter("session");
    if (urlSession) {
        filters['session'] = urlSession
        return true;
    } else {
        filters['session'] = null
        return false;
    }
}

const card_html = openreview => {
    const image = openreview.image || `${openreview.uid}.png`;
    return `<div class="industry-card m-4 text-center">
      <a href="industry_${openreview.uid}.html" class="image-wrapper mb-3" style="display: flex; align-items: center; justify-content: center;">
        <img src="static/images/sponsors/${image}" alt="${openreview.company}" onerror="this.style.display='none'" />
      </a>
      <div class="text-muted mb-2">${openreview.session || 'Sponsor'}</div>
      <h3><a href="industry_${openreview.uid}.html">${openreview.company}</a></h3>
      </div>`
}
