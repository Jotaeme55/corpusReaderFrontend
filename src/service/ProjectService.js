import axios from 'axios';
require('dotenv').config()

export default class ProjectService {

    async getNumberOfPublicProjects(){
        return await axios.get("projects/getNumberOfPublicProjects")
    }

    async getAllPublicProjects(page, limit, search){
        return axios.get('/projects/AllPublicProjects?search='+search+'&page='+page+'&limit='+limit)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }


    async guardarProyecto(title, description, publicProject, userId){
        return axios.post('/projects/'+userId, {title, description, "public":publicProject})
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async getProjectfromUser(page, limit, search, userID){
        return axios.get('/projects/getProjectsFromUser/'+userID+'?search='+search+'&page='+page+'&limit='+limit)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async getNumberOfProjectsFromUser(userID){
        return await axios.get("projects/getNumberOfProjectsFromUser/"+userID)
    }

    async getProject(projectId){
        return axios.get('/projects/'+projectId)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async saveCorpus(projectId, corpus){
        return axios.post('/corpus/'+projectId, corpus)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async getCorpusFromProject(projectId){
        return axios.get('/corpus/'+projectId)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async deleteCorpus(corpusId){
        return axios.delete('/corpus/'+corpusId)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }
}