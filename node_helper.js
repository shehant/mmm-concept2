/* Magic Mirror
 * Node Helper: {{MODULE_NAME}}
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

//{access_token: 'pxfTvgVV0xS09movti58MpCemKL9bMwmh4NhlgUL', token_type: 'Bearer', expires_in: 604800, refresh_token: 'kFdJ5qM1nUSmBftnKQnPXELfTILhPZefTbwJSgDM'}


var authToken = '';
var refreshToken = '';
var c2code = 'ANMooSmtvWZp5tC0r6NGhHdkOYRUvyhpR7yPmrgM';

const NodeHelper = require("node_helper");
const fs = require('node:fs');
var fetch = require('node-fetch');
const Log = require("logger");
const luxon = require('luxon');
const DateTime = luxon.DateTime;
const debug_flag=0;

const debugLastUpdate = DateTime.local(2024,3,18,0,0);

module.exports = NodeHelper.create({
	

	init: function() 
	{
		var nodeDataReceived=false;
        var globalLastUpdate=null;

        Log.log(`TS Initializing node helper for: ${this.name}`);
	},
	
	start: function() 
	{
		Log.log(`TS Starting node helper for: ${this.name}`);
        this.readLocalToken();
        var logData = new Array;
        this.globalLastUpdate=null;
        this.scheduleUpdate();
	},


    readLocalToken: async function() 
    {
        console.log("Reading Saved Tokens (start of readTokenFile)");
    
        let x = await fs.readFileSync(__dirname+'/concept2APIAuth_test.txt', 'utf8', (err, data) => {
            if (err) 
            {
                console.log(err);
                return;
            }
            return data;
        });
        let y = JSON.parse(x);
        authToken=y.authToken;
        refreshToken=y.refreshToken;
        console.log("Auth Token From File: "+ authToken);
        console.log("Refresh Token From File: "+ refreshToken);
        console.log("end of readTokenFile");
     },
    
    refreshTokenAPI: async function() 
    {
        console.log("Refreshing token from API");
    
        if (refreshToken=='')
        {
            let tokens = await this.readLocalToken();
        }
        
        var b='client_id=Pobvmfjmgod2UoF2KNmUt3S0krZp1vRhkZifwieS'+'&client_secret=QbOG99knbAfyjhGCUwRTvNTo1gGfpQOkwG4AUvZx' + '&grant_type=authorization_code'
        + '&code='+c2code + '&scope=user:read,results:read' + '&redirect_uri=http://www.google.com';
    
        var c= 'client_id=Pobvmfjmgod2UoF2KNmUt3S0krZp1vRhkZifwieS'+'&client_secret=QbOG99knbAfyjhGCUwRTvNTo1gGfpQOkwG4AUvZx' + '&grant_type=refresh_token'
        + '&refresh_token='+refreshToken + '&scope=user:read,results:read' + '&redirect_uri=http://www.google.com';
    
        console.log("Refresh Token Request Parameter: "+c)
    
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                accept: 'application/json',
            },
            body: c
            
            };
        
            const response = await fetch('https://log.concept2.com/oauth/access_token', requestOptions);
            if (!response.ok) {
                console.log("Error: "+response.status);
                console.error("Error");                    
            }
            const jsondata= await response.json();     
            console.log("New Token Received:");
            console.log(jsondata);  
    
        const jsonOutput = {
            authToken: jsondata.access_token,
            refreshToken: jsondata.refresh_token
        };
    
        console.log(jsonOutput);
        return jsonOutput;
    
    },
    
    updateTokenFile: async function() {
        let readfile = await this.readLocalToken();
        const jsonOutput = await this.refreshTokenAPI();      
        fs.writeFile(__dirname+'/concept2APIAuth_test.txt', JSON.stringify(jsonOutput), (err, data) => {
            if (err) 
            {
                console.error(err);
                return;
            }
    
            });
            
    },


	getLogPage: async function(logPage=1,lastUpdate=null)  
    {
		let logbookResults;
        let requestUri='https://log.concept2.com/api/users/me/results'+'?page='+logPage;
		if (lastUpdate!=null) {
			requestUri=requestUri+"&from="+lastUpdate.toFormat('yyyy-MM-dd HH:mm:ss'); 
            Log.log("requestURI: "+requestUri);
		}
        //Log.log(requestUri);
        let requestOptions = 
        {
            method: 'GET',
            headers: {
                'Content-Type': 'Applicaton/json', 
                'Authorization': "Bearer "+authToken,
            }
        };
     	const logRequest =  await fetch(requestUri,requestOptions);
        
        if (!logRequest.ok) {
            console.log("Invalid token");
            this.updateTokenFile();
        }
        else
        {        
            // add direct to JSON
            if (debug_flag==1)  
            {
                let logRequesttxt= await logRequest.text();
                Log.log(logRequesttxt);
		        logbookResults = await JSON.parse(logRequesttxt);
		
            }
            else { 
                logbookResults=await logRequest.json();
            }

            //Log.log(logbookResults);
		    //Log.log("Page Download Complete");
        
            return logbookResults;
        }
    },

    cleanJSON: function(js){
        let cleanJS =[];
        for (let i=0; i<=js.length-1; i++) {
            let tmp = js[i];
            cleanJS.push(tmp);
        }
        return cleanJS;
    },

    mergeLogs: function(log1, log2){
        for (let i=0; i<=log2.length-1; i++) {
            log1.push(log2[i]);
        }
        return log1;
    },

    getLogData: async function(lastUpdate=null)
    {
        let tmpLastUpdate= DateTime.local();
        try{Log.log("Last Updated: "+this.globalLastUpdate.toFormat('y-MM-dd TT'));}
        catch{Log.log("Last Updated: NULL");}
        let initialLog =  await this.getLogPage(1,lastUpdate); 
        let pages=initialLog.meta.pagination.total_pages;
        //Log.log("Success");
        let logDataINT=this.cleanJSON(initialLog.data);
        //Log.log("Success Cleaning");
        
        //Log.log("Log Data");
        //Log.log(logData);
        if (pages>=2) {
        Log.log("Downloading remaining " + (pages-1) + "/" +pages+" pages");
        for (let i=2; i<=pages; i++) { ////////////// PAGE COUNT HERE!!
            Log.log("Get Log Page " + i+ "/" + pages);
            let pullLog =  await this.getLogPage(i,lastUpdate);
            let cleanLog =  this.cleanJSON(pullLog.data);
            //Log.log("Log Page "+i+"/"+pages+"     Success");
            let logMerge1=logDataINT;
            let logMerge2= cleanLog;
            logDataINT = this.mergeLogs(logMerge1,logMerge2);
            Log.log("Append Log Page "+i+"/"+pages+"     Success");
        }

        }

		//this.sendSocketNotification("CONCEPT2-INITIAL-DOWNLOAD", logData);
        //Log.log("Broadcast Socket: CONCEPT2-INITIAL-DOWNLOAD")
        nodeDataReceived=true;
        this.globalLastUpdate=tmpLastUpdate;
        return logDataINT;
    } ,

    doUpdate: async function () {
            var self=this;
            Log.log("Start of Do Update Function");
            try {Log.log("Prior Last Update Date: "+self.globalLastUpdate.toISO());} catch {Log.log("Last Update: Null");}
            let logtmp = await self.getLogData(self.globalLastUpdate);
            await Log.log("LOG Tmp "+logtmp.length);
            
            if (self.nodeDataReceived==true) {
                Log.log("Merging Update Log");
                const n = [];
                if (self.logData === undefined) self.logData = new Array();
                self.logData= await self.mergeLogs(n,logtmp);
            }
            else
            {
                Log.log("Porting Initial Download");
                if (self.logData === undefined) self.logData = new Array();
                const n=self.logData;
                self.logData= await self.mergeLogs(n,logtmp);

            }
            
            await Log.log("Combined Log Length: "+self.logData.length);
            await self.sendSocketNotification("CONCEPT2-INITIAL-DOWNLOAD", self.logData);
            Log.log("Sending Broadcast Socket: CONCEPT2-INITIAL-DOWNLOAD")
    },


///test message
	scheduleUpdate: function() {
        var self=this;
		setInterval(function() {
            Log.log("Refresh Concept 2 Data ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`");
            self.doUpdate();
		}, 30*60*1000);
	},

	socketNotificationReceived: function(notification, payload) {
		Log.log(this.name+" has received a notification: "+notification);
        if (notification="REQUEST_LOG_DATA") {
            if (this.nodeDataReceived==true)
            {
                this.sendSocketNotification("CONCEPT2-INITIAL-DOWNLOAD", this.logData);
                Log.log("Socket Notification Success");
            } else 
            {
                Log.log("Socket Notification Lacks Data");
                this.doUpdate();
            }
        }
	},

});
