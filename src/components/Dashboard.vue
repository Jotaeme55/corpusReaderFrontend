<template> 
    <Toast />
    <!-- intro -->
    <section class="intro">
        <div class="bloque-projects">
            <div class="bloque-projects-content bloque-own-project">
                <h4 style="color: white;"><label for="public" class="font-semibold w-6rem">Ver tus proyectos</label></h4>
                <ToggleButton @change="changeToPrivateProject" v-model="ownProject" onLabel="Privados" offLabel="Todos" />
            </div>
            <div class="bloque-projects-content bloque-project-search ">
                <h4 style="color: white;">Buscar proyecto</h4>
                <div>
                    <InputText :style="{'margin-right': '5px;'}" type="text" v-model="search" />
                    <Button @click="searchProject" style="background-color: #1D3557;">
                        <i class="pi pi-search"></i>
                    </Button>
                </div>
            </div>
            <div class="bloque-projects-content bloque-order">
                <h4 style="color: white; padding-top: 5px;">Ordenar por:</h4>
                <Dropdown @change="changeOrder" v-model="selectedOrder" :options="order" placeholder="Selecciona el orden" class="w-full md:w-14rem" />
            </div>
        </div>
        <div class="lista-projects">
            <div class="lista-projects-ul">
                <div @click="goToCorpus(project._id)" class="project" v-for="project in projects" :key="project.id">
                    <div class="project-columnn-left">
                        <h3>{{ project.title }}</h3>
                        <div class="project-description">
                            {{ project.description }}
                        </div>
                    </div>
                    <div class="project-columnn-right">
                        <h5 style="margin: -0.5rem 0 1rem 0;">{{ project.userAsociated }}</h5>
                        <div class="project-date">
                            
                            {{ transformarFecha(project.creationDate) }}
                        </div>
                    </div>

                    
                    
                </div>
            </div>
        </div>
        <Paginator @page="changePage" :rows="6" :totalRecords="totalRecords" ></Paginator>
    </section>
    <!-- Boton crear + dialog -->
    <Button v-if="$store.state.userId!=null" class="boton-create" label="Crear proyecto" rounded @click="abrirDialogCreate" />

    <Dialog v-model:visible="showDialogCreate" modal header="Crear proyecto" :style="{ width: '30rem' }">
        <span class="p-text-secondary block mb-5">Rellena la información.</span>
        <div class="flex align-items-center gap-3 mb-3">
            <label for="título" class="font-semibold w-6rem">Título</label>
            <InputText v-model="title" id="título" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex align-items-center gap-3 mb-5">
            <label for="description" class="font-semibold w-6rem">Descripción</label>
            <Textarea v-model="description" autoResize rows="5" cols="30" />
        </div>
        <div class="flex align-items-center gap-3 mb-5">
            <label for="public" class="font-semibold w-6rem">¿Quiéres que sea público?</label>
            <ToggleButton v-model="publicProject" onLabel="Público" offLabel="Privado" />
        </div>
        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="showDialogCreate = false"></Button>
            <Button type="button" label="Save" @click="guardarProyecto()"></Button>
        </div>
    </Dialog>
</template>

<script>
import ProjectService from "../service/ProjectService";
export default {
	data() {
        return {
            selectedOrder:"más recientes",
            order:["más recientes", "más antiguos"],
            projects:null,
            page:1,
            limit:10,
            search:"",
            rows:6,
            totalRecords:10,
            showDialogCreate: false,
            title:"",
            description:"",
            publicProject:true,
            ownProject:false,
        }
        
    },
    projectService: null,
    
    async created() {
        this.projectService = new ProjectService;
	},
	async mounted() {
        const numberOfPublicProjectsResponse = await this.projectService.getNumberOfPublicProjects()
        if(numberOfPublicProjectsResponse.status!=200){
            this.$toast.add({
                            severity: 'error',
                            summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                            life: 3000
                        });
        }else{
            this.totalRecords= numberOfPublicProjectsResponse.data.count
        }

        const projectResponse = await this.projectService.getAllPublicProjects(this.page, this.rows, this.search)
        if(projectResponse.status!=200){
            this.$toast.add({
                            severity: 'error',
                            summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                            life: 3000
                        });
        }else{
            this.projects=projectResponse.data
        }
    },
    methods: {
        goToCorpus(id){
            this.$router.push("/corpus?id="+id)
        },
        transformarFecha(fechaISO) {
            const fecha = new Date(fechaISO);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1; // Sumamos 1 porque los meses comienzan en 0
            const anio = fecha.getFullYear() % 100; // Obtenemos los dos últimos dígitos del año

            // Formateamos la fecha en el formato dd/mm/yy
            const fechaFormateada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${String(anio).padStart(2, '0')}`;

            return  fechaFormateada; // Output: "29/02/24"
        },
        abrirDialogCreate(){
            this.title=""
            this.description=""
            this.showDialogCreate=true
        },
        async guardarProyecto(){
            const userId = this.$store.state.userId
            const res = await this.projectService.guardarProyecto(this.title, this.description, this.publicProject, userId)
            if( res.status!=200){
                this.$toast.add({
                                    severity: 'error',
                                    summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                                    life: 3000
                                });
            }else{
                this.goToCorpus(res.data.savedProject._id)
            }
        },

        changeToPrivateProject(){
            if(this.ownProject){
                this.searchProjectFromUser()
            }else{
                this.searchProject()
            }
        },

        async searchProject(){
            if(!this.ownProject){
                const numberOfPublicProjectsResponse = await this.projectService.getNumberOfPublicProjects()
                if(numberOfPublicProjectsResponse.status!=200){
                    this.$toast.add({
                                    severity: 'error',
                                    summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                                    life: 3000
                                });
                }else{
                    this.totalRecords= numberOfPublicProjectsResponse.data.count
                }
                const projectResponse = await this.projectService.getAllPublicProjects(this.page, this.rows, this.search)
                if(projectResponse.status!=200){
                    this.$toast.add({
                                    severity: 'error',
                                    summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                                    life: 3000
                                });
                }else{
                    this.projects=projectResponse.data
                }
            }else{
                this.searchProjectFromUser()
            }
        },

        async searchProjectFromUser() {
            const userId = this.$store.state.userId
            const numberOfProjectResponse = await this.projectService.getNumberOfProjectsFromUser(userId)
            console.log(numberOfProjectResponse)
            if (numberOfProjectResponse.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                                life: 3000
                            });
            }else{
                this.totalRecords= numberOfProjectResponse.data.count
            }
            const projectResponse = await this.projectService.getProjectfromUser(this.page, this.rows, this.search, userId)
            if (projectResponse.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                                life: 3000
                            });
            }else{
                this.projects=projectResponse.data
            }
        },
        changeOrder(){

            if (this.selectedOrder !== 'más recientes' && this.selectedOrder !== 'más antiguos') {
                throw new Error("Invalid selectedOrder parameter. Please use 'más recientes' or 'más antiguos'.");
            }

            const sortedProjects = this.projects.slice().sort((a, b) => {
                const comparison = this.selectedOrder === 'más recientes' ? 
                    new Date(b.creationDate) - new Date(a.creationDate) : 
                    new Date(a.creationDate) - new Date(b.creationDate);

                return comparison;
            });

            this.projects =  sortedProjects;
        },
        async changePage(event){
            if(!this.ownProject){
                const projectResponse = await this.projectService.getAllPublicProjects(event.page+1, this.rows, this.search)
                if(projectResponse.status!=200){
                    this.$toast.add({
                                    severity: 'error',
                                    summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos, vuelve en un rato',
                                    life: 3000
                                });
                }else{
                    this.projects=projectResponse.data
                }
            }else{
                const userId = this.$store.state.userId
                const projectResponse = await this.projectService.getProjectfromUser(event.page+1, this.rows, this.search, userId)
                if (projectResponse.status!=200){
                    this.$toast.add({
                                    severity: 'error',
                                    summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                                    life: 3000
                                });
                }else{
                    this.projects=projectResponse.data
                }
            }
        },
        
    },
	computed: {
	},
    components: {
    }
}
</script>
<style>
     /*  layout main container controla el padding del topbar y el footbar */
     /*intro ----------------------------------------------------------intro*/
    .intro{
        width: 100%;
        height: calc(100vh - 11.5rem);
        background-size: cover;
        background-color: white;
    }

    .bloque-projects{
        width: 100%;
        height: 16%;
        background-color: #3B58A8;
        border-bottom: 2px solid #000;
        display: flex;
    }

    .bloque-own-project{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .bloque-projects-content {
        flex: 1;
        text-align: center;
    }

    .bloque-project-search{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }

    .lista-projects{
        width: 100%;
        height: 75%;
        background: white;
        border-bottom: 1px solid #666666;
        overflow-y: auto;
    }

    .lista-projects-ul{
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: wrap;

    }

    .project{
        width: calc(33.33% - 20px); /* Calculamos el ancho con margen para que haya dos tarjetas por fila */
        height: 45%;
        margin: 8px; /* Espacio entre las tarjetas */
        background-color: #f0f0f0;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
    }

    .project-columnn-left{
        width: 70%;
        height:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-bottom: 5px;
    }

    .project-description{
        width: 80%;
        height: 100%;
        display: flex;
        justify-content: left;
        align-items: center;
        overflow: auto;
        padding-top: 1%;
        padding-bottom: 1%;
    }

    .project-columnn-right{
        width: 30%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-bottom: 5px;
    }

    .project:hover{
        cursor: pointer;
        transform: scale(1.1); 
        background-color: rgb(170, 169, 169);
    }




    .project-date{
        width: 100%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }
    
    /*intro ----------------------------------------------------------intro*/
    
    .boton-create{
        position: fixed;
        bottom: 4.8rem;
        right: 4rem;
        background-color: #3B58A8;
        color: #fff;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
    
</style>