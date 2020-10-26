const hubspot = require('@hubspot/api-client')
const fs = require("fs");

module.exports = function (common) {

    this.type = "contacts"
    this.hubspotClient = new hubspot.Client({ apiKey: common.hubspotApiKey})
    this.api = this.hubspotClient.crm.contacts
    this.associationApi = this.hubspotClient.crm.associations
    this.initialize = (type)=>{

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
        return this.hubspotClient.crm.owners.defaultApi.getPage().
        then((resp)=>{
            cb(null, resp.body.results)
        })
    }


    this.addCompanyProperties = ( path, cb)=>{
        fs.readFile(path, (err, data)=> {
            if (err) throw err;
            const properties = JSON.parse(data);
            console.log(properties);
            this.hubspotClient.crm.properties.batchApi.create("company", {
                inputs: properties
            }).then((res)=>{
                cb(null, res.body)
            }).catch(cb)
        })
    }

    this.addContactProperties = (path, cb)=>{
        fs.readFile(path, (err, data)=> {
            if (err) throw err;
            const properties = JSON.parse(data);
            console.log(properties);
            this.hubspotClient.crm.properties.batchApi.create("contact", {
                inputs: properties
            }).then((res)=>{
                cb(null, res.body)
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
            console.log( JSON.stringify( {"inputs":  data.map( it=>{
                let x = {... it};
                let id = x[keyName]
                delete x[keyName]
                let temp =  { properties: x }
                temp[keyName] = id
                return temp
            } )}))
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


    this.delete = (objectName,id)=>{
        if (Array.isArray(data)){
            return this.api.batchApi.archive({
                "inputs":  data.map( x=>{return { id:x}} )
            })
        }else {
            return this.api.basicApi.archive(id)
        }
    }


    this.associateObject = (objectName1, objectName2, associations)=>{
        return this.associationApi.batchApi.create(objectName1, objectName2,{
            "inputs": associations.map( it=>{return {from: {id: it.from}, to: {id: it.to}, type: it.type}})
        })
    }


    this.get = (properties, id)=>{
        if(id){
            return this.api.get()
        }else{
            return this.api.getAll()
        }

    }

// filters: [{ propertyName: 'createdate', operator: 'GTE', value: Date.now() - 30 * 60000 }]
    this.search = (objectName, properties, filters, page)=>{
        return this.api.searchApi.doSearch({
            filterGroups: [
                {
                    filters: filters
                }
            ],
            properties: [properties],
            limit: 100,
            after: page

        })
    }





}
