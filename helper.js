
function getC2Week (currentDate = new DateTime.now().startOf('day')) {

    let seasonStart = currentDate.plus({});
        
    // Calc Start Date
    if (currentDate.month < 5)
        {seasonStart=seasonStart.set({year: currentDate.year-1, month:5, day:1});}
        else {seasonStart=seasonStart.set({year: currentDate.year, month:5, day:1});}


    // Calc Week 2 Start Date
    if (seasonStart.weekday==0)
        {week2Start =  DateTime.local(seasonStart.year,5,2);}
        else {week2Start = DateTime.local(seasonStart.year,5,9-seasonStart.weekday);}

    //console.log("week2Start: "+week2Start);
    //console.log("Current Date: "+currentDate); 
    let weekNum=0;

        
    // Calc Number of Weeks

    if (currentDate<week2Start) 
    { 
         weekNum=1;
    }
    else
    {

         weekNum = Math.floor(Interval.fromDateTimes(week2Start,currentDate).length('weeks')+2,0);
    }
    return weekNum;

}   

var summaryDataTxt= `
    {
        "lastUpdated": null,
        "thisSeason": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0
        },
        "lastSeasonYTD": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0
        },
        "lastSeasonTotal": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0
        },
        "thisWeek": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0
        },
        "yoyWeek": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0

        },
        "last4Weeks": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0
        },
        "yoyLast4Weeks": 
        {
            "startDate": null,
            "meters": 0,
            "rowtime": 0,
            "calories": 0,
            "numberOfDays": 0

        }
    }`;

var template='';
const template_fixed = `

    <div id="row_template_wrapper">
    <div><h3>Rowing Record</h3> </div>
    <div>
        <table id="rowingResults">
            <tr class="colheaders">
                <th></th>
                <th align=right>Workouts</th>
                <th align=right>Meters</th>
                <th align=right>Pace</th>
            </tr>
            
            <!-- This Season -->
            
            <tr class="seasonHeader">
                <td colspan="4" align=left>2023-2024 Season</td>
            </tr>

            <tr class="thisSeason TW">
                <th class="lefthead">Week {weekNum}</th>
                <td align=right>{TW_Workouts}</td>
                <td align=right>{TW_Meters}</td>
                <td align=right>{TW_Pace}</td>
            </tr>

            <tr class="thisSeason L4W">
                <th class="lefthead">L4W</th>
                <td align=right>{L4W_Workouts}</td>
                <td align=right>{L4W_Meters}</td>
                <td align=right>{L4W_Pace}</td>
            </tr>

            <tr class="thisSeason SeasonResults">
                <th class="lefthead">Season</th>
                <td align=right>{Season_Workouts}</td>
                <td align=right>{Season_Meters}</td>
                <td align=right>{Season_Pace}</td>
            </tr>
            <tr>
            <td>&nbsp;
            </tr>
            <!-- Last Season -->
            <tr class="seasonHeader">
                <td colspan="4" align=left>2022-2023 Season</td>
            </tr>
            <tr class="yoySeason TW">
                <th class="lefthead">Week {lastWeekNum}</th>
                <td align=right>{YoY_TW_Workouts}</td>
                <td align=right>{YoY_TW_Meters}</td>
                <td align=right>{YoY_TW_Pace}</td>
            </tr>

            <tr class="yoySeason L4W">
                <th class="lefthead">L4W</th>
                <td align=right>{YoY_L4W_Workouts}</td>
                <td align=right>{YoY_L4W_Meters}</td>
                <td align=right>{YoY_L4W_Pace}</td>
            </tr>

            <tr class="yoySeason SeasonResults">
                <th class="lefthead">Season Ytd.</th>
                <td align=right>{YoY_Season_Workouts}</td>
                <td align=right>{YoY_Season_Meters}</td>
                <td align=right>{YoY_Season_Pace}</td>
            </tr>
            <tr class="yoyTotSeason SeasonResults">
                <th class="lefthead">Season Tot.</th>
                <td align=right>{YoY_Tot_Season_Workouts}</td>
                <td align=right>{YoY_Tot_Season_Meters}</td>
                <td align=right>{YoY_Tot_Season_Pace}</td>
            </tr>            

            <!-- 
            <tr class="seasonHeader">
                <td colspan="4" align=left>&#916; Change</td>
            </tr>
            <tr class="ch TW">
                <th class="lefthead">Week</th>
                <td align=right>{Ch_TW_Workouts}</td>
                <td align=right>{Ch_TW_Meters}</td>
                <td align=right>{Ch_TW_Pace}</td>
            </tr>

            <tr class="ch L4W">
                <th class="lefthead">L4W</th>
                <td align=right>{Ch_L4W_Workouts}</td>
                <td align=right>{Ch_L4W_Meters}</td>
                <td align=right>{Ch_L4W_Pace}</td>
            </tr>

            <tr class="ch SeasonResults">
                <th class="lefthead">Season</th>
                <td align=right>{Ch_Season_Workouts}</td>
                <td align=right>{Ch_Season_Meters}</td>
                <td align=right>{Ch_Season_Pace}</td>
            </tr>
        -->
        </table>
    </div>
    <div>&nbsp;</div>
    <div id="goal">{weeks_left} weeks left in season. Row {goal_calcMeterstoGoal}K m/wk to reach your goal</div>
    <div id="rowDays">You have rowed {percent_row_days}% this year vs. {yoy_percent_row_days}% last year</div> 
</div>

`;