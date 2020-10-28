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
    this.baseCrm  = this.baseUrl + "crm/v3/"
    this.baseSchema  = this.baseUrl + "crm-object-schemas/v3/"

    this.createCOSchema =  (data)=>{
        return axios.post(this.baseSchema + "schemas",data,{
            params: {
                hapikey: common.hubspotApiKey
            }
        })
    }

    this.fetchCOSchema =  (objectName)=>{
        return axios.get(this.baseSchema + "schemas/"+objectName,{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.deleteCOSchema =  (objectName)=>{
        return axios.delete(this.baseSchema + "schemas/"+objectName,{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }

    this.deleteCOSchemaPurge =  (objectName)=>{
        return axios.delete(this.baseSchema + "schemas/"+objectName+"/purge",{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.insert = (objectName,data)=>{
        if (Array.isArray(data)){
            return axios.post(this.baseCrm + "objects/"+objectName+"/batch/create", {
                "inputs":  data.map( x=>{return { properties:x}} )
            },{
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }else{
            return axios.post(this.baseCrm + "objects/"+objectName, {
                properties: data
            },{
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }

    }

    this.update = (objectName,data, keyName)=>{

        if (Array.isArray(data)){
            return axios.post(this.baseCrm + "objects/"+objectName+"/batch/update", {
                "inputs":  data.map( it=>{
                    let x = {... it};
                    let id = x[keyName]
                    delete x[keyName]
                    let temp =  { properties: x }
                    temp[keyName] = id
                } )
            },{
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }else {
            let x = {... data};
            let id = x[keyName];
            delete x[keyName];
            return axios.patch(this.baseCrm + "objects/" + objectName + "/" + id, {
                properties: x
            }, {
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }
    }


    this.delete = (objectName,id)=>{
        if (Array.isArray(data)){
            return axios.post(this.baseCrm + "objects/"+objectName+"/batch/archive", {
                "inputs":  data.map( x=>{return { id:x}} )
            },{
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }else {
            return axios.delete(this.baseCrm + "objects/" + objectName + "/" + id, {
                params: {
                    hapikey: common.hubspotApiKey,
                    portalId: common.portalId
                }
            })
        }
    }


    this.get = (objectName, limit, after,  properties, id)=>{
        return axios.get(this.baseCrm + "objects/"+objectName + (id?  "/"+id : "" ), {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId,
                paginateAssociations: 'false',
                archived: 'false',
                properties: properties,
                limit: limit,
                after: after,
            }
        })
    }

// filters: [{value: 'string', propertyName: 'string', operator: 'EQ'} ]
    this.search = (objectName, properties, filters, page)=>{
        return axios.post(this.baseCrm + "objects/"+objectName+"/search", {
            filterGroups: [
                {
                    filters: filters
                }
            ],
            properties: [properties],
            limit: 100,
            after: page

        }, {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId,
                paginateAssociations: 'false',
                archived: 'false'
            }
        })
    }


    this.associateObject = (objectName1, objectName2, associations)=>{
        return axios.post(this.baseCrm + "associations/"+objectName1+"/"+objectName2+"/batch/"+"create", {
            "inputs": associations.map( it=>{return {from: {id: it.from}, to: {id: it.to}, type: it.type}})
        },{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.addAssociation = (objectName, data)=>{
        return axios.post(this.baseSchema + "schemas/"+objectName+"/associations",data,{
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


    this.addProperty = (objectName, data)=>{
        return axios.post(this.baseCrm + "properties/"+objectName, data, {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }



    this.updateSchema = (objectName,data)=>{
        return axios.patch(this.baseSchema + "schemas/"+objectName, data, {
            params: {
                hapikey: common.hubspotApiKey,
                portalId: common.portalId
            }
        })
    }


}
