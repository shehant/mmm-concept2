
var c2code = 'cBaEAADBVn3cTfupIitmfdqPqueGTvOlnBaYk27c';
var refresh_token = 'qkDpZi6ay9inGCFvkvSMyOAK9SSJq6GRPb40dNfC';
var access_token='RexAaRVLBTuQTvSjmNLj9zpe4jofFJ1xhvslgfXS';

var b='client_id=Pobvmfjmgod2UoF2KNmUt3S0krZp1vRhkZifwieS'+'&client_secret=QbOG99knbAfyjhGCUwRTvNTo1gGfpQOkwG4AUvZx' + '&grant_type=authorization_code'
+ '&code='+c2code + '&scope=user:read,results:read' + '&redirect_uri=http://www.google.com';

var c= 'client_id=Pobvmfjmgod2UoF2KNmUt3S0krZp1vRhkZifwieS'+'&client_secret=QbOG99knbAfyjhGCUwRTvNTo1gGfpQOkwG4AUvZx' + '&grant_type=refresh_token'
+ '&refresh_token='+refresh_token + '&scope=user:read,results:read' + '&redirect_uri=http://www.google.com';

console.log(b);
console.log(c);


const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
    },
    body: b
    
};




    fetch('https://log.concept2.com/oauth/access_token', requestOptions)
    .then(response => response.json()) 
    .then(json=>console.log(json))   
    .catch(error => {
      console.log(error)
    });

 //   access_token: 'k711VDaIDsFu4OqsrobSouezjyAM5HCh3LUJozh7', token_type: 'Bearer', expires_in: 604800, refresh_token: '7bC5x6uxmG2ayUIyZoXv0W6P8hfaopnYuL3Ta2WV'}
