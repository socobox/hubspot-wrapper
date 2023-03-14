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
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }

    this.fetchCOSchema =  (objectName)=>{
        return axios.get(this.baseSchema + "schemas/"+objectName,{
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


    this.deleteCOSchema =  (objectName)=>{
        return axios.delete(this.baseSchema + "schemas/"+objectName,{
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }

    this.deleteCOSchemaPurge =  (objectName)=>{
        return axios.delete(this.baseSchema + "schemas/"+objectName+"/purge",{
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


    this.insert = (objectName,data)=>{
        if (Array.isArray(data)){
            return axios.post(this.baseCrm + "objects/"+objectName+"/batch/create", {
                "inputs":  data.map( x=>{return { properties:x}} )
            },{
                params: {
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
                }
            })
        }else{
            return axios.post(this.baseCrm + "objects/"+objectName, {
                properties: data
            },{
                params: {
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
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
                    return temp;
                } )
            },{
                params: {
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
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
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
                }
            })
        }
    }


    this.delete = (objectName,data)=>{
        if (Array.isArray(data)){
            return axios.post(this.baseCrm + "objects/"+objectName+"/batch/archive", {
                "inputs":  data.map( x=>{return { id:x}} )
            },{
                params: {
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
                }
            })
        }else {
            return axios.delete(this.baseCrm + "objects/" + objectName + "/" + data, {
                params: {
                    portalId: common.portalId
                },
                headers: {
                    'Authorization': `Bearer `+common.privateAccessToken,
                    'Content-Type': 'application/json'
                }
            })
        }
    }


    this.get = (objectName, limit, after,  properties, id)=>{
        return axios.get(this.baseCrm + "objects/"+objectName + (id?  "/"+id : "" ), {
            params: {
                portalId: common.portalId,
                paginateAssociations: 'false',
                archived: 'false',
                properties: properties,
                limit: limit,
                after: after,
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }

// filters: [{value: 'string', propertyName: 'string', operator: 'EQ'} ]
    this.search = (objectName,  filterGroups, properties, limit, after)=>{
        limit = limit? limit:100
        after = after? after: 0
        return axios.post(this.baseCrm + "objects/"+objectName+"/search", {
            filterGroups: filterGroups,
            properties: properties,
            limit: limit,
            after: after

        }, {
            params: {
                portalId: common.portalId,
                paginateAssociations: 'false',
                archived: 'false'
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


    this.associateObject = (objectName1, objectName2, associations)=>{
        return axios.post(this.baseCrm + "associations/"+objectName1+"/"+objectName2+"/batch/"+"create", {
            "inputs": associations.map( it=>{return {_from: {id: it.from}, to: {id: it.to}, type: it.type}})
        },{
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


    this.addAssociation = (objectName, data)=>{
        return axios.post(this.baseSchema + "schemas/"+objectName+"/associations",data,{
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


    this.addProperty = (objectName, data)=>{
        return axios.post(this.baseCrm + "properties/"+objectName, data, {
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }



    this.updateSchema = (objectName,data)=>{
        return axios.patch(this.baseSchema + "schemas/"+objectName, data, {
            params: {
                portalId: common.portalId
            },
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            }
        })
    }


}
