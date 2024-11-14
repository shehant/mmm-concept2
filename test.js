const fs = require('node:fs');

var authToken='';
var refreshToken='';
var c2code = 'ANMooSmtvWZp5tC0r6NGhHdkOYRUvyhpR7yPmrgM';

readLocalToken = async function () {
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
}


refreshTokenAPI= async function() {
            console.log("Refreshing token from API");

            if (refreshToken=='')
            {
                let tokens = await readLocalToken();
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
        
}

saveTokenFile= async function () {
    let readfile = await readLocalToken();
    //await setTimeout(()=>{},"5000");
    console.log("Refresh Token from File: "+refreshToken);
    const jsonOutput = await refreshTokenAPI();      
    fs.writeFile(__dirname+'/concept2APIAuth_test.txt', JSON.stringify(jsonOutput), (err, data) => {
        if (err) 
        {
            console.error(err);
            return;
        }

        });
        
}

saveTokenFile();
