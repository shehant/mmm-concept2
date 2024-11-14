/* To Do:

- Output template
- Auto refresh token
- Auto update

*/



Module.register("concept2", 
{
    
	defaults: {
		updateInterval: 60*60*1000,
		retryDelay: 5000,
        goal: 400000,
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	getScripts: function() {
        return [
            this.file("./helper.js"),
            this.file("luxon.js")
            ];
    },

    getStyles: function () {
		return [

		];
	},

	init: function() {
		var self = this;        
        var dataReceived = false;
        var dataSummarized=false;
        var summaryData;
        this.loaded = false;
    },
    
    start: function() {
		//Flag for check if module is loaded
		// Schedule update timer.
        var self=this;
        this.dataReceived=false;
        Log.info("DATA LOADED "+this.dataReceived);

        if(this.dataReceived==false) {
            this.sendSocketNotification("REQUEST_LOG_DATA",{message:"REQUEST_LOG_DATA"});
        }


		setInterval(function() {
			self.updateDom();
            Log.info("Refreshing page");
		},  this.config.updateInterval);



	},


    // Function to summarize the data received from NodeJS

    summarizeLogData: function(logData)
    {
        console.log("");
        console.log("");
        console.log("Summarizing Data");
        let n=logData.length;
        
        summaryData=JSON.parse(summaryDataTxt);



        console.log(summaryData);
        
        // Set Cutoff Dates
    
        // Season
        let currentDate= DateTime.now().startOf('day');
        let currentWeekNum = getC2Week(currentDate);
    
        summaryData.thisWeek.weekNum = currentWeekNum;
        summaryData.yoyWeek.weekNum = currentWeekNum;
    
        // Calc Season Start Date
        if (currentDate.month < 5)
            {
                summaryData.thisSeason.startDate = DateTime.local(currentDate.year-1,5,1,0,0);
                summaryData.lastSeasonYTD.startDate = DateTime.local(currentDate.year-2,5,1,0,0);
                summaryData.lastSeasonTotal.startDate = DateTime.local(currentDate.year-2,5,1,0,0);
            }
            else {
                summaryData.thisSeason.startDate = DateTime.local(currentDate.year,5,1,0,0);
                summaryData.lastSeasonYTD.startDate = DateTime.local(currentDate.year-1,5,1,0,0);
                summaryData.lastSeasonTotal.startDate = DateTime.local(currentDate.year-1,5,1,0,0);
            }
    
        // Calc Week Start Date
        if (currentDate.weekday==0)
            {summaryData.thisWeek.startDate=currentDate.plus({days: -6});}
            else {summaryData.thisWeek.startDate=currentDate.plus({days: -currentDate.weekday+1});}
        
        // Calc L4Week Start Date
        if (currentDate.weekday==0)
            {summaryData.last4Weeks.startDate=currentDate.plus({days: -6-21});}
            else {summaryData.last4Weeks.startDate=currentDate.plus({days: -currentDate.weekday+1-21});}
    
        //Calc Week YoY and L4Week YoY Start Date
    
        // Calc Week 2 Start Date
        if (summaryData.lastSeasonTotal.startDate.weekday==0)
        {   
            let week2Start =  DateTime.local(summaryData.lastSeasonTotal.startDate.year,5,2);
            summaryData.yoyWeek.startDate=week2Start.plus({weeks: currentWeekNum-2});
            summaryData.yoyLast4Weeks.startDate=week2Start.plus({weeks: currentWeekNum-5});
        }
        else 
        {
            let week2Start = DateTime.local(summaryData.lastSeasonTotal.startDate.year,5,9-summaryData.lastSeasonTotal.startDate.weekday);
            
            console.log("Week2Start: "+week2Start);
            console.log("Current Week Num: "+currentWeekNum);
            
            summaryData.yoyWeek.startDate=week2Start.plus({weeks: currentWeekNum-2});
            summaryData.yoyLast4Weeks.startDate=week2Start.plus({weeks: currentWeekNum-5});
        }
    
        // Output to console
        console.log("");
        console.log("Current Date: "+currentDate.toLocaleString());
        console.log("Current Week Num: "+currentWeekNum);
        console.log("");
        
        console.log("Season Start Date: "+summaryData.thisSeason.startDate.toLocaleString());
        console.log("Week Start Date: "+summaryData.thisWeek.startDate.toLocaleString());
        console.log("L4 Week Start Date: "+summaryData.last4Weeks.startDate.toLocaleString());
    
        console.log("");
        console.log("Last Season Start Date: "+summaryData.lastSeasonYTD.startDate.toLocaleString());
        console.log("Last Season Tot Start Date: "+summaryData.lastSeasonTotal.startDate.toLocaleString());
        console.log("");
        console.log("YoY Week Start Date: "+summaryData.yoyWeek.startDate.toLocaleString());
        console.log("YoY L4 Week Start Date: "+summaryData.yoyLast4Weeks.startDate.toLocaleString());
    
        // Loop through data
        for (let i=0; i<=logData.length-1; i++)
        {
    
            // Date Filters
            let workoutDate = DateTime.fromJSDate(new Date(logData[i].date));  
            let workoutWeek = getC2Week(workoutDate); 
            if (workoutDate > summaryData.lastUpdated) {
                summaryData.lastUpdated=workoutDate;
            }
    
            // Season Stats
            
            // This year
            if (workoutDate >= summaryData.thisSeason.startDate)
            {          
                summaryData.thisSeason.calories += logData[i].calories_total;
                summaryData.thisSeason.meters += logData[i].distance;
                summaryData.thisSeason.rowtime += logData[i].time;
            }
            
            // Last Season YTD
            if ( workoutDate >= summaryData.lastSeasonYTD.startDate && workoutDate <= currentDate.plus({years: -1}))
            {
                summaryData.lastSeasonYTD.calories += logData[i].calories_total;
                summaryData.lastSeasonYTD.meters += logData[i].distance;
                summaryData.lastSeasonYTD.rowtime += logData[i].time;
            }
    
            // Last Season Total
            if ( workoutDate >= summaryData.lastSeasonTotal.startDate && workoutDate< summaryData.thisSeason.startDate)
            {
                summaryData.lastSeasonTotal.calories += logData[i].calories_total;
                summaryData.lastSeasonTotal.meters += logData[i].distance;
                summaryData.lastSeasonTotal.rowtime += logData[i].time;
            }
            
           // This Week
           
            if (workoutDate >= summaryData.thisWeek.startDate)
            {
                
                summaryData.thisWeek.calories += logData[i].calories_total;
                summaryData.thisWeek.meters += logData[i].distance;
                summaryData.thisWeek.rowtime += logData[i].time;
            }
            
            // Last week
            if (workoutDate >= summaryData.yoyWeek.startDate && workoutDate < summaryData.yoyWeek.startDate.plus({days:7}))
            {
                summaryData.yoyWeek.calories += logData[i].calories_total;
                summaryData.yoyWeek.meters += logData[i].distance;
                summaryData.yoyWeek.rowtime += logData[i].time;
            }
            
            // L4W
            if (workoutDate >= summaryData.last4Weeks.startDate)
            {
                //Log.info("Workout :"+workoutDate.toISO()+" meters: "+logData[i].distance);
                summaryData.last4Weeks.calories += logData[i].calories_total;
                summaryData.last4Weeks.meters += logData[i].distance;
                summaryData.last4Weeks.rowtime += logData[i].time;
            }
    
            // L4W YoY
            if (workoutDate >= summaryData.yoyLast4Weeks.startDate && workoutDate < summaryData.yoyLast4Weeks.startDate.plus({days:28}))
            {
                summaryData.yoyLast4Weeks.calories += logData[i].calories_total;
                summaryData.yoyLast4Weeks.meters += logData[i].distance;
                summaryData.yoyLast4Weeks.rowtime += logData[i].time;
            }
          
    
        } 
        // Calc Number of Days ///////////////////////////////////////////////////////////////////
    
        // Create unique set of days
        let uniqueDaySet = new Set(logData.map(({date}) => DateTime.fromJSDate(new Date(date)).startOf('day').toString()));
        let uniqueDayArrayTmp = Array.from(uniqueDaySet);
        let uniqueDayArray=[];
        for (let i=0; i<uniqueDayArrayTmp.length;i++){
            uniqueDayArray.push(DateTime.fromISO(uniqueDayArrayTmp[i]));
        }
        
        // Season Calcs ///////////////////////////////////////////////////////////////////////////
    
        // This Season Number of Days
        summaryData.thisSeason.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {        
                if (currentValue >= summaryData.thisSeason.startDate) {
                    accumulator++;}
                return accumulator;
            }
        , 0);
    
    
        // Last Season Total Number of Days
        summaryData.lastSeasonTotal.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {
                if (currentValue >= summaryData.lastSeasonTotal.startDate && currentValue < summaryData.thisSeason.startDate)
                    {accumulator++;}
                return accumulator;
            }
        , 0);
    
    
        // Last Season YTD Number of Days
            summaryData.lastSeasonYTD.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {
                if (currentValue >= summaryData.lastSeasonYTD.startDate && currentValue <= currentDate.plus({years: -1}))
                    {accumulator++;}
                return accumulator;
            }
        , 0);
    
        // This Week Number of Days
        summaryData.thisWeek.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {    
                if (currentValue >= summaryData.thisWeek.startDate)
                   {accumulator++;}
                return accumulator;
            }
        , 0);
    
        // YoY Week
        summaryData.yoyWeek.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {    
                if (currentValue >= summaryData.yoyWeek.startDate && currentValue < summaryData.yoyWeek.startDate.plus({days:7}))
                    {accumulator++;}
                return accumulator;
            }
        , 0);
    
        // L4Weeks
        summaryData.last4Weeks.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {    
                if (currentValue >= summaryData.last4Weeks.startDate)
                   {accumulator++;} 
                return accumulator;
            }
        , 0);
    
    
        // YoY L4 Weeks Week
        summaryData.yoyLast4Weeks.numberOfDays = uniqueDayArray.reduce((accumulator, currentValue) => {    
                if (currentValue >= summaryData.yoyLast4Weeks.startDate && currentValue < summaryData.yoyLast4Weeks.startDate.plus({days:28}))
                    {accumulator++;}
    
                return accumulator;
            }
        , 0);
    
        console.log(summaryData);
        dataSummarized=true;
        return summaryData;
    
    },



	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		var self = this;
        if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		setInterval(function() {
			self.getDom();
		}, nextLoad);
	},

	getDom: function() {
		// create element wrapper for show into the module
		var self=this;
        var wrapper = document.createElement("div");
        wrapper.id='rowing_output';
		wrapper.className=this.config.type;

        // If data isnt loaded, output a placeholder, otherwise provide the full data
        if (self.dataReceived!=true)
        {
            wrapper.innerHTML="[Data Pending]";
        }
        else{
            Log.info("Update DOM");
            wrapper.innerHTML=template;
        }

		return wrapper;
	},

	// socketNotificationReceived from helper
    
    socketNotificationReceived: function (notification, payload) {

		if(notification === "CONCEPT2-INITIAL-DOWNLOAD") {
            var self=this;
			Log.info(notification);
            Log.info(payload);
            summaryData=this.summarizeLogData(payload);
            this.dataReceived=true;

            Log.info("Received and Summarized "+this.dataReceived);


            self.writeContent();

            Log.info("Content Written");


            self.updateDom();
		}
	},

    writeContent:  function() {
        
        let pace;
        
        // This Season
        self.template=template_fixed;
        self.template = self.template.replace("{TW_Workouts}", self.summaryData.thisWeek.numberOfDays)  ;
        self.template = self.template.replace("{weekNum}", self.summaryData.thisWeek.weekNum)  ;


        self.template = self.template.replace("{TW_Meters}", (self.summaryData.thisWeek.meters/1000).toFixed(1)+"K")  ;     
            //pace
            
            if (self.summaryData.thisWeek.meters>0) {
            pace = new Duration.fromMillis(self.summaryData.thisWeek.rowtime*100*500/self.summaryData.thisWeek.meters);}
            else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{TW_Pace}", pace) ;


        self.template = self.template.replace("{L4W_Workouts}", self.summaryData.last4Weeks.numberOfDays) ;
        self.template = self.template.replace("{L4W_Meters}", (self.summaryData.last4Weeks.meters/1000).toFixed(1)+"K") ;
            //pace
            if (self.summaryData.last4Weeks.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.last4Weeks.rowtime*100*500/self.summaryData.last4Weeks.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{L4W_Pace}", pace) ;

        self.template = self.template.replace("{Season_Workouts}", self.summaryData.thisSeason.numberOfDays) ;
        self.template = self.template.replace("{Season_Meters}", (self.summaryData.thisSeason.meters/1000).toFixed(1)+"K") ;
            //pace
            if (self.summaryData.thisSeason.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.thisSeason.rowtime*100*500/self.summaryData.thisSeason.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{Season_Pace}", pace) ;

        // Last Season
        self.template = self.template.replace("{YoY_TW_Workouts}", self.summaryData.yoyWeek.numberOfDays) ;
        self.template = self.template.replace("{lastWeekNum}", self.summaryData.yoyWeek.weekNum) ;
        self.template = self.template.replace("{YoY_TW_Meters}", (self.summaryData.yoyWeek.meters/1000).toFixed(1)+"K")              ;   
            //pace
            if (self.summaryData.yoyWeek.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.yoyWeek.rowtime*100*500/self.summaryData.yoyWeek.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{YoY_TW_Pace}", pace) ;


        self.template = self.template.replace("{YoY_L4W_Workouts}", self.summaryData.yoyLast4Weeks.numberOfDays) ;
        self.template = self.template.replace("{YoY_L4W_Meters}", (self.summaryData.yoyLast4Weeks.meters/1000).toFixed(1)+"K") ;
            //pace
            if (self.summaryData.yoyLast4Weeks.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.yoyLast4Weeks.rowtime*100*500/self.summaryData.yoyLast4Weeks.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{YoY_L4W_Pace}", pace) ;

        self.template = self.template.replace("{YoY_Season_Workouts}", self.summaryData.lastSeasonYTD.numberOfDays) ;
        self.template = self.template.replace("{YoY_Season_Meters}", (self.summaryData.lastSeasonYTD.meters/1000).toFixed(1)+"K") ;
            //pace
            if (self.summaryData.lastSeasonYTD.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.lastSeasonYTD.rowtime*100*500/self.summaryData.lastSeasonYTD.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{YoY_Season_Pace}", pace) ;

        self.template = self.template.replace("{YoY_Tot_Season_Workouts}", self.summaryData.lastSeasonTotal.numberOfDays) ;
        self.template = self.template.replace("{YoY_Tot_Season_Meters}", (self.summaryData.lastSeasonTotal.meters/1000).toFixed(1)+"K") ;
            //pace
            if (self.summaryData.lastSeasonTotal.meters>0) {
                pace = new Duration.fromMillis(self.summaryData.lastSeasonTotal.rowtime*100*500/self.summaryData.lastSeasonTotal.meters);}
                else {pace=new Duration.fromMillis(0);}
            pace= pace.toFormat("m:s");
            self.template = self.template.replace("{YoY_Tot_Season_Pace}", pace) ;




        /*// % Change
        self.template = self.template.replace("{Ch_TW_Workouts}", self.summaryData.yoyWeek.numberOfDays) ;
        self.template = self.template.replace("{Ch_TW_Meters}", (self.summaryData.yoyWeek.meters/1000).toFixed(1)+"K")              ;   
        self.template = self.template.replace("{Ch_TW_Pace}", "PACE") ;


        self.template = self.template.replace("{Ch_L4W_Workouts}", self.summaryData.yoyLast4Weeks.numberOfDays) ;
        self.template = self.template.replace("{Ch_L4W_Meters}", (self.summaryData.yoyLast4Weeks.meters/1000).toFixed(1)+"K") ;
        self.template = self.template.replace("{Ch_L4W_Pace}", 'PACE') ;

        self.template = self.template.replace("{Ch_Season_Workouts}", self.summaryData.lastSeasonYTD.numberOfDays) ;
        self.template = self.template.replace("{Ch_Season_Meters}", (self.summaryData.lastSeasonYTD.meters/1000).toFixed(1)+"K") ;
        self.template = self.template.replace("{Ch_Season_Pace}", 'PACE') ;

        */

        let weeksLeft=52 - self.summaryData.thisWeek.weekNum+1;
        let tgtMetersWk = ((this.config.goal - self.summaryData.thisSeason.meters)/ weeksLeft / 1000).toFixed(1)
        Log.info("tgtMtersWk: "+tgtMetersWk)
        

        
        let seasonDaysTotal= Math.ceil(new Interval.fromDateTimes(self.summaryData.thisSeason.startDate,DateTime.local()).length("days"));
        
        
        let pctDays = Math.trunc(self.summaryData.thisSeason.numberOfDays*1000/seasonDaysTotal)/10;
        let pctDaysYoY = Math.trunc(self.summaryData.lastSeasonYTD.numberOfDays*1000/seasonDaysTotal)/10;
        


        Log.info("total days: "+ seasonDaysTotal);
        Log.info("percent days remaining: "+pctDays);
        
        
        
        
        self.template = self.template.replace("{percent_row_days}", pctDays) ;
        self.template = self.template.replace("{yoy_percent_row_days}", pctDaysYoY) ;
        self.template = self.template.replace("{weeks_left}", weeksLeft) ;
        self.template = self.template.replace("{goal_calcMeterstoGoal}", tgtMetersWk) ;



    },
    
    
    

});