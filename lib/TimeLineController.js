const  axios =  require("axios");

module.exports = function (common) {

    // declare a request interceptor
    axios.interceptors.request.use(config => {
        // perform a task before the request is sent
       // console.log(config);

        return config;
    }, error => {
        // handle the error
        console.log(error)
        return Promise.reject(error);
    });

    // declare a response interceptor
    axios.interceptors.response.use((response) => {
        // do something with the response data
        //console.log(response);

        return response;
    }, error => {
        // handle the response error
        console.log(error)
        return Promise.reject(error);
    });

    this.baseUrl = "https://api.hubapi.com/"
    this.base  = this.baseUrl + "crm/v3/timeline/events"
    this.oauth  = this.baseUrl + "oauth/v1/token"
    this.baseSchema  = this.baseUrl + "crm/v3/timeline/"+common.appId+"/event-templates"
    this.expirationTime = 0;

    this.createTemplate =  (data)=>{
        return axios.post(this.baseSchema,data,{
            params: {
                hapikey: common.hubspotDevKey
            }
        })
    }

    this.fetchTemplates =  ()=>{
        return axios.get(this.baseSchema ,{
            params: {
                hapikey: common.hubspotDevKey
            }
        })
    }

    this.updateTemplate =  (templateId, data)=>{
            return axios.put(this.baseSchema+"/"+templateId,data,{
                params: {
                    hapikey: common.hubspotDevKey
                }
            })
        }




    this.insert = (data)=>{
        if (Array.isArray(data)){
            return axios.post(this.base + "/batch/create", {
                "inputs":  data
            },{
                 headers: {
                 'content-type': 'application/json',
                 'authorization': 'Bearer '+this.accessToken
                 }
            })
        }else{
            return axios.post(this.base , data,{
                headers: {
                 'content-type': 'application/json',
                 'authorization': 'Bearer '+this.accessToken
                 }
            })
        }

    }


    this.refreshToken = ()=>{
        return axios.post(this.oauth, encodeForm({
            grant_type: 'refresh_token',
            client_id: common.clientId,
            client_secret: common.clientSecret,
            refresh_token: common.refreshToken
        }),{
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        })

    }

    this.encodeForm = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
            .join('&');
    }

    this.createEvents = async (data, cb)=>{
        if ( (new Date()).getTime() - this.expirationTime >= 0){
            let tokenData  =  await this.refreshToken();
            this.expirationTime =  (new Date()).getTime()  +  tokenData.data.expires_in*1000;
            this.accessToken =   tokenData.data.access_token;
        }
        this.insert(data).then(d=>{cb(null, d)}).catch(cb);

    }





}
