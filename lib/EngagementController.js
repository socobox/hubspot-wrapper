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
    this.baseCrm  = this.baseUrl + "engagements/v1/"

    this.insert = (data)=>{
        
        return axios.post(this.baseCrm + "engagements/", data,{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    

    }

    this.update = (data, keyName)=>{
        let x = {... data};
        let id = x[keyName];
        delete x[keyName];
        return axios.patch(this.baseCrm + "engagements/" + id, x, {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.delete = (data)=>{
        return axios.delete(this.baseCrm + "engagements/" + data, {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.get = (limit, id)=>{
        return axios.get(this.baseCrm + "engagements/" + (id?  "/"+id : "/paged" ), {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId,
                limit: limit,
            }
        })
    }

}
