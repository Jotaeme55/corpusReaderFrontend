<template> 
    <Toast />
    <!-- intro -->
    <section class="usuarios-intro">
        <div class="bloque-users">
            <div class="bloque-users-create">
                <h4 style="color: white;">Crear usuario</h4>
                <Button @click="createUser" style="background-color: #1D3557;">
                    <i class="pi pi-user-plus"></i>
                </Button>/>

            </div>
            <div class="bloque-users-search">
                <h4 style="color: white;">Buscar usuario</h4>
                <div>
                    <InputText type="text" v-model="search" />
                    <Button @click="searchUser" style="background-color: #1D3557;">
                        <i class="pi pi-search"></i>
                    </Button>
                </div>
                
            </div>
            <div class="bloque-users-page">

            </div>
        </div>
        <div class="lista-users">
            <ul class="lista-users-ul">
                <li class="user-row" v-for="user in users" :key="user.id">
                    <div class="div-user-row-left">
                        <h4 style="margin: 0; font-weight:bold;">{{ user.username }}</h4>
                        <br>
                        <h5 style="margin: 0;">Fecha de creación: {{ transformarFecha(user.creationDate) }}</h5>
                    </div>
                    <div class="div-user-row-right">
                        <h6 @click="updateUser(user._id)" class="user-actions edit-user" style="margin: 0;">Editar</h6> 
                        
                        <h6 @click="deleteUser(user._id)" class="user-actions delete-user" style="padding-top:5px;margin: 0;">Eliminar</h6>
                        <br>
                        <div class="make-user-admin" :style="{ display:userId==user._id ? 'none' : 'flex' }">
                            <h6 style="margin:0; padding-right: 5px;">Administrador</h6>
                            <Checkbox @change="updateAdmin(user._id)" v-model="user.isAdmin" :binary="true" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <Paginator @page="changePage" :rows="5" :totalRecords="totalRecords" ></Paginator>
    </section>
</template>

<script>
import UserService from "../service/UserService";

export default {
	data() {
        return {
            userId:null,
            users:null,
            page:1,
            limit:10,
            search:"",
            rows:5,
            totalRecords:10

        }
        
    },
    userService: null,
    async created() {
        this.userService = new UserService;
	},
	async mounted() {
        const userId = this.$store.state.userId
        this.userId = userId
        const numberOfUsers = await this.userService.getNumberOfUsers(userId)
        if(numberOfUsers.status!=200){
            this.$toast.add({
                            severity: 'error',
                            summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                            life: 3000
                        });
        }else{
            console.log("el numero de usuarios totales es "+ numberOfUsers.data.number)
            this.totalRecords = parseInt(numberOfUsers.data.number)
        
        }


        const usersResponse = await this.userService.getUsers(this.page, this.rows, this.search, userId)
        if (usersResponse.status!=200){
            this.$toast.add({
                            severity: 'error',
                            summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                            life: 3000
                        });
        }else{
            this.users = usersResponse.data
        }
        
       
    },
    methods: {
        createUser(){
            this.$router.push("/register")
        },
        transformarFecha(fechaISO) {
            const fecha = new Date(fechaISO);
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
            const opcionesHora = { hour: 'numeric', minute: 'numeric' };

            const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);
            const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);

            return `${fechaFormateada}, ${horaFormateada}`;
        },
        async searchUser() {
            const userId = this.$store.state.userId
            const usersResponse = await this.userService.getUsers(this.page, this.rows, this.search, userId)
            if (usersResponse.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                                life: 3000
                            });
            }else{
                this.users = usersResponse.data
            }
        },
        async changePage(event){
            const userId = this.$store.state.userId
            const usersResponse = await this.userService.getUsers(event.page+1, this.rows, "", userId)
            if (usersResponse.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los usuarios, vuelve en un rato',
                                life: 3000
                            });
            }else{
                this.users = usersResponse.data
            }
        },
        async updateAdmin(userIdToModify){
            await this.userService.updateAdmin(this.userId,userIdToModify)
        },
        async deleteUser(userIdToDelete){
            console.log("se borra el user "+ userIdToDelete)
            await this.userService.deleteUser(this.userId, userIdToDelete)
            const response = await this.userService.getUsers(1, 5, "", this.userId)
            this.users = response.data
            this.totalRecords = parseInt(this.totalRecords)-1
        },

        async updateUser(userId){
            this.$router.push(`/register?userId=${userId}`)
        }
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
    .usuarios-intro{
        width: 100%;
        height: calc(100vh - 11.5rem);
        background-size: cover;
    }

    .bloque-users{
        width: 100%;
        height: 15%;
        background-color: #3B58A8;
        display: flex;
        align-items: center;
        justify-content: space-around;
        
    }

    .bloque-users-create{
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }

    .bloque-users-search{
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }

    .lista-users{
        width: 100%;
        height: 75%;
        background: white;
        border-bottom: 1px solid #666666;
        overflow-y: auto;
    }

    .lista-users-ul{
        width: 100%;
        height: 100%;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .user-row{
        width: 100%;
        height: 20%;
        border-bottom: 1px solid #666666;
        list-style: none;
        margin-left: 0;
        padding: 0;
        display: flex;
        background-color: #E0E5F2;
        
    }

    .div-user-row-left{
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .div-user-row-right{
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .user-actions{
        cursor: pointer;
        
    }

    .user-actions:hover{
        color: #666666;
    }

    .edit-user{
        margin-top: 5px;
        color: #3B58A8;
    }

    .delete-user{
        color:crimson
    }

    .make-user-admin{
        margin-bottom: 5px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    /*intro ----------------------------------------------------------intro*/
    

    
</style>