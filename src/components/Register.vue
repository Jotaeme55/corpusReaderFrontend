<template>
    <Toast />
    <div class="flex align-items-center justify-content-center overflow-hidden mt-5 mb-5">
        <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
            <div class="col-12 mt-5 xl:mt-0 text-center">
                <!-- <img :src="topbarImage()" alt="Logo" class="mb-5"> -->
            </div>
            <div class="col-12 xl:col-6" style=" padding:0.3rem;">
                <div class="h-full w-full m-0 py-7 px-4" :style="'background: #1D3557'">
                    <div class="text-center mb-5">
                        <!-- <img :src="topbarImage()" alt="Logo" class="mb-3" width="100"> -->
                        <h1 style="color: white;">CORPUS</h1>
                        <div class=" font-medium mb-3" style="font-size:2.5rem; color:#FCC200; font-family:'Roboto';">Crear una cuenta</div>
                    </div>
                
                    <div class="w-full md:w-10 mx-auto">
                        <label for="usernameId" class="block text-900 text-xl mb-2" style="font-size:1.2rem; color:#ffffff !important; font-family: 'Montserrat';">Nombre de usuario</label>
                        <InputText v-model="user.username" name="username" id="usernameId" @keypress.enter="saveUser()"
                        :class="{'p-invalid': error.field === 'username'} + '; w-full mb-2'" placeholder="username" style="padding:1rem;" />
                        <small class="p-invalid" :key="errorUsername" v-if="(errorUsername || errorUser)">{{this.errorUsername}}{{ this.errorUser }}</small>
                
                        <label for="passwordId" class="block text-900 text-xl mt-2 mb-2" style="font-size:1.2rem; color:#ffffff !important; font-family: 'Montserrat';">Contraseña</label>
                        <Password v-model="user.password" name="password" id="passwordId" :feedback="false" @keypress.enter="saveUser()" 
                        :class="{'p-invalid': error.field === 'password'}" placeholder="Contraseña" :toggleMask="true"
                        class="w-full mb-2" inputClass="w-full" inputStyle="padding:1rem" />
                        <small class="p-invalid" :key="errorPassword" v-if="errorPassword">{{this.errorPassword}}</small>


                        <small class="p-error" v-if="error.message === 'Missing credentials'">¡Algunos campos están en blanco!</small>

                        <div class="grid justify-content-center mt-5">
                            <Button :style="{ display: editar? 'block' : 'none' }" type="button" icon="pi pi-user-plus" label="Editar" class="p-3 text-xl text-900 col-12 md:col-5 mt-2" 
                             style="background-color:var(--surface-card)" />
							<Button :style="{ display: editar? 'none' : 'block' }" type="button" icon="pi pi-user-plus" label="Registrar" class="p-3 text-xl text-900 col-12 md:col-5 mt-2" 
                            @click="saveUser()" style="background-color:var(--surface-card)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserService from "../service/UserService";
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
export default {
    name: 'Register',
    components: {
    InputText,
    Password,
    Button,
    },
    created() {
        this.userService = new UserService;
    },
    data() {
        return {
            user: {},
            error: {},
            errorPassword: null,
            errorUsername: null,
            errorUser: null,
            userId : null,
            enviadoUnaVez: false,
            editar:false,
            usernameCambiado:""
        }
    },
    userService: null,
    async mounted() {
        const userId = this.$router.currentRoute._value.query.userId
        if(userId){
            console.log("se está editando")
            this.editar = true
            const user = await this.userService.getUser(userId)
            console.log(user.data)
            this.user.username = user.data.user.username
            this.usernameCambiado = user.data.user.username
            this.user.password = ""
            this.$toast.add({severity:'success', summary: 'Successful', detail: 'Añade una nueva contraseña para el usuario', life: 3000});
        }else{
            console.log("se está creando un user")
        }
    },
    updated(){

    },
    computed: {
        loggedIn() {
            return this.$store.state.loggedIn;
        }
    },
    
    methods: {
        topbarImage() {
            return '/images/favicon.svg';
        },

        async comprobarCampos() {
            let resultado = true;
            /* eslint-disable */
            // Verificar el correo electrónico
            if (!this.user.username) {
                resultado = false;
                this.errorUser = 'El nombre de usuario es obligatorio';
            } else {
                if(!(this.editar) || (this.editar && this.user.username != this.usernameCambiado)){   
                    try {
                        let data = await this.userService.checkUserExists(this.user.username);
                        
                        if (data.userExists == "true") {
                            resultado = false;
                            this.errorUser = 'El nombre de usuario ya está en uso';
                        } else {
                            this.errorUser = null;
                        }
                    } catch (error) {
                        console.error(error);
                        resultado = false;
                        this.errorUser = 'Error al verificar el usuario';
                    }
                }

            }

            // Verificar la contraseña
            if (!this.user.password || this.user.password.length < 8) {
                resultado = false;
                this.errorPassword = 'La contraseña es obligatoria y debe tener al menos 8 caracteres';
            } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(this.user.password)) {
                resultado = false;
                this.errorPassword = 'La contraseña debe tener al menos una letra y un número';
            } else {
                this.errorPassword = null;
            }

            return resultado;
        },

        async saveUser(){
            
            const comprobado = await this.comprobarCampos()
            if (comprobado){
                if(this.editar){
                    console.log("se está editando un user")
                    await this.userService.editar(this.user)
                }else{
                    console.log("se está creando un user")
                    await this.userService.guardar(this.user)
                }
                this.$router.push("/usuarios")
            }else{
                console.error("campos erróneos crear")
            }
        },

    },
}
</script>

<style>
    .p-invalid{
        color: #FCC200;
    }

	.colortexto:hover{
		color: #FCC200 !important;
	}

    .code-square {
        display: inline-block;
        width: 40px;
        height: 40px;
        margin: 10px;
        text-align: center;
        font-size: 30px;
        line-height: 40px;
        border: 1px solid black;
        cursor: pointer;
    }

    .selected {
        background-color: black;
        color: white;
    }

</style>
