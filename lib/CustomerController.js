const hubspot = require('@hubspot/api-client')
const fs = require("fs");
const axios = require("axios");
const qs = require('qs')

module.exports = function (common) {

    this.type = "contacts"
    this.hubspotClient = new hubspot.Client({ accessToken: common.privateAccessToken})
    this.api = this.hubspotClient.crm.contacts
    this.associationApi = this.hubspotClient.crm.associations
    this.initialize = (type)=>{
        this.type = type
        switch (type) {
            case "companies":{
                this.api = this.hubspotClient.crm.companies
                break;
            }
            default:{
                this.api = this.hubspotClient.crm.contacts
            }
        }
    }

    this.getUser = (cb)=>{
        return this.hubspotClient.crm.owners.ownersApi.getPage().
        then((resp)=>{
            cb(null, resp.results)
        })
    }


    this.addCompanyProperties = ( path, cb)=>{
        fs.readFile(path, (err, data)=> {
            if (err) throw err;
            const properties = JSON.parse(data);
           // console.log(properties);
            this.hubspotClient.crm.properties.batchApi.create("company", {
                inputs: properties
            }).then((res)=>{
                cb(null, res)
            }).catch(cb)
        })
    }

    this.addContactProperties = (path, cb)=>{
        fs.readFile(path, (err, data)=> {
            if (err) throw err;
            const properties = JSON.parse(data);
            //console.log(properties);
            this.hubspotClient.crm.properties.batchApi.create("contact", {
                inputs: properties
            }).then((res)=>{
                cb(null, res)
            }).catch(cb)
        })
    }

    this.insert = (data)=>{
        if (Array.isArray(data)) {
           return this.api.batchApi.create({
               "inputs":  data.map( x=>{return { properties:x}} )
           })
        }else{
            return  this.api.basicApi.create({properties: data});
        }
    }

    this.update = (data,keyName)=>{
        if (Array.isArray(data)) {
            // console.log( JSON.stringify( {"inputs":  data.map( it=>{
            //     let x = {... it};
            //     let id = x[keyName]
            //     delete x[keyName]
            //     let temp =  { properties: x }
            //     temp[keyName] = id
            //     return temp
            // } )}))
            return this.api.batchApi.update({
                "inputs":  data.map( it=>{
                    let x = {... it};
                    let id = x[keyName]
                    delete x[keyName]
                    let temp =  { properties: x }
                    temp[keyName] = id
                    return temp
                } )
            })
        }else{
            let x = {... data};
            let id = x[keyName];
            delete x[keyName];
            let temp =  { properties: x }
            temp[keyName] = id
            return  this.api.basicApi.update(id ,temp);
        }
    }


    this.delete = (objectName,data)=>{
        if (Array.isArray(data)){
            return this.api.batchApi.archive({
                "inputs":  data.map( x=>{return { id:x}} )
            })
        }else {
            return this.api.basicApi.archive(data)
        }
    }


    this.associateObject = (objectName1, objectName2, associations)=>{
        return this.associationApi.batchApi.create(objectName1, objectName2,{
            "inputs": associations.map( it=>{return {_from: {id: it.from}, to: {id: it.to}, type: it.type}})
        })
    }

    this.deleteAsociation = (objectName1, objectName2, associations)=>{
        return this.associationApi.batchApi.archive(objectName1, objectName2,{
            "inputs": associations.map( it=>{return {_from: {id: it.from}, to: {id: it.to}, type: it.type}})
        })
    }

    this.readAsociation = (objectName1, objectName2, ids)=>{
        return this.associationApi.batchApi.read(objectName1, objectName2,{
            "inputs": ids.map( it=>{return {id: it};})
        })
    }

    this.addProperty = (data, cb)=>{

        return this.hubspotClient.crm.properties.batchApi
            .create( this.type==="companies"? "company": "contact", {
                     inputs: data
             }).then((res)=>{
                     cb(null, res)
                 }).catch(cb)


    }


    this.get = (limit, after, properties, associations, id, history)=>{
        if(id){
            return this.api.get(id)
        }else{
            return this.api.getAll(limit, after, properties, history, associations)
        }

    }

    this.baseUrl = "https://api.hubapi.com/"
    this.baseCrm  = this.baseUrl + "companies/v2/"
    this.getPropertyHistory = ( limit, after,  properties, propertiesWithHistory)=>{
        let params = {
            portalId: common.portalId,
            limit: limit,
            offset: after
        }
        if (propertiesWithHistory){
            params.propertiesWithHistory = properties
        }else{
            params.properties = properties
        }
        return axios.get(this.baseCrm + "companies/paged", {
            params: params,
            headers: {
                'Authorization': `Bearer `+common.privateAccessToken,
                'Content-Type': 'application/json'
            },
            paramsSerializer: function(params) {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            }
        })

    }

    // filters: [{ propertyName: 'createdate', operator: 'GTE', value: Date.now() - 30 * 60000 }]
    this.search = ( filterGroups, properties, limit, after)=>{
        limit = limit? limit:100
        after = after? after: 0
        return this.api.searchApi.doSearch({
            filterGroups:  filterGroups,
            properties: properties,
            limit: limit,
            after: after

        })
    }





}
