function make_cal(name) {

    // console.log(location.search, "--- location.search");

    const toConferenceDate = function (value) {
        const parsed = moment.parseZone(value);
        return new Date(
            parsed.year(),
            parsed.month(),
            parsed.date(),
            parsed.hour(),
            parsed.minute(),
            parsed.second()
        );
    };

    const formatScheduleTime = function (value) {
        return moment(value.getTime()).format('HH:mm');
    };

    const formatScheduleDate = function (value) {
        return moment(value.getTime()).format('YYYY-MM-DD');
    };

    const scheduleMinutes = function (value) {
        return value.getHours() * 60 + value.getMinutes();
    };

    const escapeHtml = function (value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            }[character];
        });
    };

    const makeFloatingEvent = function (event) {
        const start = toConferenceDate(event.start);
        const displayEnd = toConferenceDate(event.end);
        return Object.assign({}, event, {
            title: formatScheduleTime(start) + '-' + formatScheduleTime(displayEnd) + ' ' + event.title,
            start: start,
            end: displayEnd,
        });
    };

    // requires moments.js
    const enumerateDaysBetweenDates = function (startDate, endDate) {
        const dates = [];

        // console.log(startDate, endDate, "--- startDate, endDate");

        const currDate = moment(startDate);
        const lastDate = moment(endDate);

        dates.push(currDate.clone());
        while (currDate.add(1, 'days').diff(lastDate) < 0) {
            // console.log(currDate, "--- currDate");
            dates.push(currDate.clone());
        }

        dates.push(lastDate);
        return dates;
    };


    $.get('serve_config.json').then(config => {
        const hourStart = config.calendar.hour_start || 8;
        const hourEnd = config.calendar.hour_end || 23;
        const timegridHourHeight = 80;

        const adjustCalendarEventLayout = function (rootSelector) {
            const apply = function () {
                const dayGroups = {};
                document.querySelectorAll(rootSelector + ' .calendar-event-label')
                  .forEach(label => {
                    const content = label.closest('.tui-full-calendar-time-schedule-content-time');
                    const block = content ? content.closest('.tui-full-calendar-time-date-schedule-block') : null;
                    const startMinutes = Number(label.dataset.calendarStart);
                    const endMinutes = Number(label.dataset.calendarEnd);
                    const day = label.dataset.calendarDay;
                    if (!content || !block || !day || Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
                        return;
                    }
                    const durationMinutes = endMinutes - startMinutes;
                    const durationHeight = Math.floor(durationMinutes * timegridHourHeight / 60) - 2;
                    const height = Math.max(16, durationHeight);
                    const lineHeight = parseFloat(window.getComputedStyle(content).lineHeight) || 15;
                    const availableTextHeight = Math.max(lineHeight, height - 4);
                    const lineClamp = Math.max(1, Math.floor(availableTextHeight / lineHeight));
                    block.style.height = height + 'px';
                    block.style.paddingLeft = '0';
                    content.style.height = height + 'px';
                    if (label) {
                        label.style.setProperty('--calendar-line-clamp', String(lineClamp));
                    }
                    dayGroups[day] = dayGroups[day] || [];
                    dayGroups[day].push({
                        block: block,
                        start: startMinutes,
                        end: endMinutes,
                    });
                });

                Object.keys(dayGroups).forEach(day => {
                    const sortedItems = dayGroups[day].sort((a, b) => {
                        return a.start - b.start || a.end - b.end;
                    });
                    let cluster = [];
                    let clusterEnd = -1;

                    const layoutCluster = function (items) {
                        if (items.length === 0) {
                            return;
                        }
                        const lanes = [];
                        items.forEach(item => {
                            let lane = lanes.findIndex(end => end <= item.start);
                            if (lane < 0) {
                                lane = lanes.length;
                                lanes.push(item.end);
                            } else {
                                lanes[lane] = item.end;
                            }
                            item.lane = lane;
                        });

                        const laneCount = lanes.length;
                        items.forEach(item => {
                            if (laneCount === 1) {
                                item.block.style.left = '0';
                                item.block.style.right = '0';
                                item.block.style.width = 'auto';
                                return;
                            }

                            const width = 100 / laneCount;
                            const left = item.lane * width;
                            item.block.style.left = 'calc(' + left + '% + ' + (item.lane > 0 ? 2 : 0) + 'px)';
                            item.block.style.right = 'auto';
                            item.block.style.width = 'calc(' + width + '% - 2px)';
                        });
                    };

                    sortedItems.forEach(item => {
                        if (cluster.length > 0 && item.start >= clusterEnd) {
                            layoutCluster(cluster);
                            cluster = [];
                            clusterEnd = -1;
                        }
                        cluster.push(item);
                        clusterEnd = Math.max(clusterEnd, item.end);
                    });
                    layoutCluster(cluster);
                });
            };
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(apply);
            });
        };

        $.get(name).then(rawEvents => {
            const events = rawEvents.map(makeFloatingEvent);
            const all_cals = [];

            const min_date = d3.min(events.map(e => e.start));
            const Calendar = tui.Calendar;
            const calendar = new Calendar('#calendar', {
                defaultView: 'week',
                isReadOnly: true,
                // useDetailPopup: true,
                taskView: false,
                scheduleView: ['time'],
                usageStatistics: false,
                // useDetailPopup: true,
                week: {
                    // workweek: !config.calendar["sunday_friday"],
                    daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    startDayOfWeek: 0,
                    hourStart: hourStart,
                    hourEnd: hourEnd,
                    // narrowWeekend: true,
                },
                theme: {
                  'week.dayname.height': '42px',
                  'week.timegridOneHour.height': timegridHourHeight + 'px',
                  // 'week.dayGridSchedule.height': '100px',
                },
                template: {
                    monthDayname: function (dayname) {
                        return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
                    },
                    timegridDisplayPrimaryTime: function (time) {
                      // var meridiem = time.hour < 12 ? 'am' : 'pm';
                      var hour = time.hour < 10 ? `0${time.hour}` : time.hour;
                      var min = time.minutes === 0 ? '00' : time.minutes;
                      return hour + ':' + min;
                    },
                    time: function (schedule) {
                        const titleParts = schedule.title.split(' ');
                        const timeRange = titleParts.shift();
                        const title = titleParts.join(' ');
                        const startMinutes = scheduleMinutes(schedule.start);
                        let endMinutes = scheduleMinutes(schedule.end);
                        if (endMinutes <= startMinutes) {
                            endMinutes += 24 * 60;
                        }
                        return '<span class="calendar-event-label" title="' + escapeHtml(schedule.title)
                          + '" data-calendar-day="' + escapeHtml(formatScheduleDate(schedule.start))
                          + '" data-calendar-start="' + startMinutes
                          + '" data-calendar-end="' + endMinutes + '"><strong>'
                          + escapeHtml(timeRange) + '</strong> ' + escapeHtml(title) + '</span>';
                    },
                    milestone: function (schedule) {
                        return '<span class="calendar-font-icon ic-milestone-b"></span> <span style="background-color: ' + schedule.bgColor + '"> M: ' + schedule.title + '</span>';
                    },
                    weekDayname: function (model) {
                        const parts = model.renderDate.split('-');
                        return '<span class="tui-full-calendar-dayname-name"> ' + parts[1] + '/' + parts[2] + '</span>&nbsp;&nbsp;<span class="tui-full-calendar-dayname-name">' + model.dayName + '</span>';
                    },
                },
            });
            calendar.setDate(min_date);
            calendar.createSchedules(events);
            adjustCalendarEventLayout('#calendar');
            calendar.on({
                'clickSchedule': function (e) {
                    const s = e.schedule;
                    if (s.location.length > 0) {
                        window.open(s.location, '_self');
                    }
                },
            })

            all_cals.push(calendar);

            const cols = config.calendar.colors;
            if (cols) {
                const cals = [];
                Object.keys(cols).forEach(k => {
                    const v = cols[k];
                    cals.push({
                        id: k,
                        name: k,
                        bgColor: v,
                    })
                })

                calendar.setCalendars(cals);

            }


            const week_dates = enumerateDaysBetweenDates(
              calendar.getDateRangeStart().toDate(),
              calendar.getDateRangeEnd().toDate())

            const c_sm = d3.select('#calendar_small')
            let i = 0
            for (const day of week_dates) {
                c_sm.append('div').attr('id', 'cal__' + i);
                const cal = new Calendar('#cal__' + i, {
                    defaultView: 'day',
                    isReadOnly: true,
                    // useDetailPopup: true,
                    taskView: false,
                    scheduleView: ['time'],
                    usageStatistics: false,
                    week: {
                        hourStart: hourStart,
                        hourEnd: hourEnd,
                    },
                    theme: {
                        'week.dayname.height': '42px',
                        'week.timegridOneHour.height': timegridHourHeight + 'px',
                    },
                })

                cal.setDate(day.toDate());
                cal.createSchedules(events);
                adjustCalendarEventLayout('#cal__' + i);
                cal.on({
                    'clickSchedule': function (e) {
                        const s = e.schedule;
                        if (s.location.length > 0) {

                            if (s.location.split("-")[0] === 'tab') {
                              var location = s.location.split("|");
                              $('.nav-pills .nav-item .nav-link').eq(location[1]).trigger('click');
                              $(`#tab-${location[1]} #day .${location[location.length - 1]}`)[0].scrollIntoView();
                              $('html')[0].scrollTop -= 150;
                            } else {
                              window.open(s.location, '_blanket');
                            }
                        }
                    },
                })

                all_cals.push(cal);
                const cols = config.calendar.colors;
                if (cols) {
                    const cals = [];
                    Object.keys(cols).forEach(k => {
                        const v = cols[k];
                        cals.push({
                            id: k,
                            name: k,
                            bgColor: v,
                        })
                    })

                    cal.setCalendars(cals);

                }

                i++;

                // console.log(day.format(), "--- day");
            }

            // console.log(week_dates.map(d => d.format()), "--- week_dates ");


            const resize = async function (cal) {
                await cal.render(true);
                adjustCalendarEventLayout('#calendar');
                for (let index = 0; index < i; index++) {
                    adjustCalendarEventLayout('#cal__' + index);
                }
                // d3.selectAll('.tui-full-calendar-vlayout-area').attr('style',null);
            }

            $(window).on('resize', _.debounce(function () {
                all_cals.forEach(c => resize(c));
            }, 100));
            // d3.selectAll('.tui-full-calendar-vlayout-area').attr('style',null);
        })

    })
}

$(window).ready(function() {

})
