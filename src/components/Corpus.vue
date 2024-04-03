<template> 
    <Toast />
    <section class="corpus-intro">
        <div class="bloque-corpus">
            <div class="bloque-corpus-content bloque-own-project">
                <Button  label="Añadir corpus" rounded @click="abrirDialogAddCorpus=true" />
            </div>
            <div class="bloque-corpus-content bloque-project-title ">
                <h4 v-if="project!=null && arrayJSON.length==0" style="color: white;">{{project.title}}</h4>
                <h4 v-if="arrayJSON.length>0" style="color: white;">Buscar proyecto</h4>
                <div v-if="arrayJSON.length>0">
                    <InputText :style="{'margin-right': '5px;'}" type="text"  />
                    <Button  style="background-color: #1D3557;">
                        <i class="pi pi-search"></i>
                    </Button>
                </div>

            </div>
            <div class="bloque-corpus-content bloque-project-user">
                <h4 v-if="project!=null && arrayJSON.length==0" style="color: white;" >{{ project.userAsociated }}</h4>
                <h4 style="color: white; padding-top: 5px;">Opciones:</h4>
                <MultiSelect @change="cambiaOpciones" style="margin-bottom: 5px;" v-if=" arrayJSON.length>0" v-model="selection" display="chip" :options="selections"  placeholder="Selecciona opciones"
                        :maxSelectedLabels="3" class="w-full md:w-20rem" />
                </div>
        </div>
        <div :style="{'display': arrayJSON.length==0? 'block':'none'}" class="bloque-instrucciones">
            <div class="bloque-instrucciones-cabecera">
                <h1>Pincha en las etiquetas para ver un ejemplo</h1>
            </div>
            <div class="bloque-instrucciones-cuerpo"> 
                <div class="instrucciones">
                    <h3 @click="verEtiqueta('text')" class="instruccion">Etiqueta text</h3>
                    <h3 @click="verEtiqueta('p')" class="instruccion">Etiqueta p</h3>
                    <h3 @click="verEtiqueta('s')" class="instruccion">Etiqueta s</h3>
                    <h3 @click="verEtiqueta('add')" class="instruccion">Etiqueta add </h3>
                    <h3 @click="verEtiqueta('reform')" class="instruccion">Etiqueta reform</h3>
                </div>
                <div  class="ejemplo">
                    <div class="card-ejemplo">
                        <h4>
                        {{ explicacion }}
                        </h4>
                        <pre>
                            <span v-for="part in formatoNegrita(textoEtiqueta)" :key="part" :style="{ fontWeight: part.negrita ? 'bold' : 'normal' }">{{ part.texto }}</span>
                        </pre>
                    </div>

                        
                </div>
            </div>
            
        </div>
        <div :style="{'display': arrayJSON.length>0? 'flex':'none'}" class="bloque-cards">
            <Card class="card-corpus" v-for="(json, index) in arrayJSON" :key="index">

                <template #title>
                    <div class="titulo-card">
                        {{project.title}} 
                    </div>
                    <div v-if="project.userAsociated===$store.state.username" :id="'eliminar-' + project.title" class="boton-eliminar-card">
                        <Button @click="deleteCorpus(json.id)" style="background-color: crimson" label="Eliminar" />
                    </div>

                </template>
                <template #content>

                    <!-- <p @mouseup="seleccionarElemento(index)" @mousedown="elementoInicio=index" v-for="(item, index) in json" :key="index" :id="index">
                        {{ item }}
                    </p> -->
                    <div v-for="(parragraph, index) in json.data" :key="index" :id="index">
                        <div v-for="(element,id) in parragraph" :key="element">
                            <p :id="id" class="parragraph-s" style="display: flex;" v-html="agregarElementosAlTexto(element.texto, element.add, element.reform)"></p>
                            
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </section>
    <Dialog v-model:visible="abrirDialogAddCorpus" modal header="Añadir corpus" :style="{ width: '25rem' }">
        <span class="p-text-secondary block mb-5">Añade tu archivo xml.</span>
        <FileUpload  name="demo[]" @uploader="onAdvancedUpload(file)" :multiple="false" accept=".xml" :maxFileSize="1000000">
            <template #header="{ chooseCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-file-pdf" rounded outlined :disabled="files && files.length >= 1"></Button>
                        <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                </div>
            </template>
            <template #empty>
                <p>Drag and drop files to here to upload.</p>
            </template>
            <template #content="{ files }">
                <div v-if="files.length > 0" >
                    <p>{{ files[0].name }}</p>
                    <Button style="margin-top: 10px;" @click="uploadFile(files)">Guardar corpus</Button>
                </div>
            </template>
        </FileUpload>
    </Dialog>
</template>

<script>
import ProjectService from "../service/ProjectService";
export default {
	data() {
        return {
            selection:[],
            selections:["add", "reform"],
            id_project:null,
            project:null,
            abrirDialogAddCorpus:false,
            arrayJSON:[],
            elementoInicio:"",
            elementoFinal:"",
            textoEtiqueta:`                       
                        \r\n <text xml:space="preserve">
                        \r\n    <p tuid="p1" id="p-1">
                        \r\n        <lb id="e-1"/>
                        \r\n        <speaker><hi rend="bold">Eulalia</hi></speaker>
                        \r\n        <lb id="e-2"/>
                        \r\n        <s tuid="s1" id="s-1">En hora buena estés, mi muy desseada xanthipe.</s>
                        \r\n    </p>
                        \r\n </text>`,
            explicacion:"Esto es un ejemplo"
        }
        
    },
    projectService: null,
    
    async created() {
        this.projectService = new ProjectService;
	},
	async mounted() {
        const id = this.$route.query.id;
        this.id_project = id;
        const projectResponse = await this.projectService.getProject(id)
        if(projectResponse.status!=200){
            this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos',
                                life: 3000
                            });
        }else{
            this.project=projectResponse.data
            const corpusResponse = await this.projectService.getCorpusFromProject(id)
            if(corpusResponse.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos importar los proyectos',
                                life: 3000
                            });
            }else{
                const corpusList = corpusResponse.data
                
                const dataList = corpusList.map(corpus => ({ id: corpus._id, data: corpus.data }));
                this.arrayJSON = dataList
            }
        }
    },
    methods: {
        async deleteCorpus(id){

            const response = await this.projectService.deleteCorpus(id)
            console.log(response)
            if (response.status!=200){
                this.$toast.add({
                                severity: 'error',
                                summary: 'Actualmente hay un error en el servidor y no podemos eliminar el corpus',
                                life: 3000
                            });
            }else{
                this.arrayJSON = this.arrayJSON.filter(j=>j.id!=id)
            }
        },
        cambiaOpciones(){
            
            if (this.selection.includes("add")){
                let elementosAdd = document.querySelectorAll('.add');
                // Iterar sobre cada elemento y aplicar el estilo para subrayar de rojo
                elementosAdd.forEach(add => {
                    add.style.textDecoration = "underline";
                    add.style.color = "red";
                });
            }
            else if (!this.selection.includes("add")){
                let elementosAdd = document.querySelectorAll('.add');
                // Iterar sobre cada elemento y aplicar el estilo para subrayar de rojo
                elementosAdd.forEach(add => {
                    add.style.textDecoration = "none";
                    add.style.color = "black";
                });
            }
        },

        agregarElementosAlTexto(texto, listaAdd, listaReform) {
            let resultado = '';
            if(texto!=undefined){
                let contador = listaAdd.length + listaReform.length;
                let ultimoFin = 0;
                
                for (let i = 0; i < contador; i++) {
                    let posicionActual;
                    let palabra;
                    if (listaAdd.length > 0 && (listaReform.length === 0 || listaAdd[0][0] < listaReform[0][0])) {
                        posicionActual = listaAdd.shift(); // Eliminar y obtener el primer elemento de listaAdd
                        palabra = "add";
                    } else {
                        posicionActual = listaReform.shift(); // Eliminar y obtener el primer elemento de listaReform
                        palabra = "reform";
                    }
                    let [inicio, fin] = posicionActual;
                    let subcadena = texto.substring(inicio, fin);
                    resultado += texto.substring(ultimoFin, inicio) + `<p class="${palabra}">${subcadena}</p>`;
                    ultimoFin = fin;
                }
                
                resultado += texto.substring(ultimoFin);
                console.log(resultado)
                return resultado
            }
                
                // Actualiza el texto renderizado con v-html
                
            },
        formatoNegrita(texto) {
            return texto.split(/\*\*(.*?)\*\*/g).map((part, index) => ({
                texto: part,
                negrita: index % 2 !== 0
            }));
        },
        verEtiqueta(etiqueta){
            if( etiqueta === "text"){
                this.explicacion = "Todo debe estar dentro de una etiqueta text"
                this.textoEtiqueta = 
                       `\r\n **<text xml:space="preserve">**
                        \r\n    <p tuid="p1" id="p-1">
                        \r\n        <lb id="e-1"/>
                        \r\n        <speaker><hi rend="bold">Eulalia</hi></speaker>
                        \r\n        <lb id="e-2"/>
                        \r\n        <s tuid="s1" id="s-1">En hora buena estés, mi muy desseada xanthipe.</s>
                        \r\n    </p>
                        \r\n **</text>**`
            }else if( etiqueta === "p"){
                this.explicacion = "Cada vez que alguien hace una intervención se marca en una etiqueta p"
                this.textoEtiqueta =`
                        \r\n    **<p tuid="p1" id="p-1">**
                        \r\n        <lb id="e-1"/>
                        \r\n        <speaker><hi rend="bold">Eulalia</hi></speaker>
                        \r\n        <lb id="e-2"/>
                        \r\n        <s tuid="s1" id="s-1">En hora buena estés, mi muy desseada xanthipe.</s>
                        \r\n    **</p>**`
            }else if(etiqueta === "s"){
                this.explicacion = "Cada frase que tenga un personaje tendrá una etiqueta s"
                this.textoEtiqueta =`
                        \r\n    <p tuid="p1" id="p-1">
                        \r\n        <lb id="e-1"/>
                        \r\n        <speaker><hi rend="bold">Eulalia</hi></speaker>
                        \r\n        <lb id="e-2"/>
                        \r\n        **<s tuid="s1" id="s-1">**Esta es la primera frase.**</s>**
                        \r\n        **<s tuid="s1" id="s-1">**Esta es la segunda frase.**</s>**
                        \r\n    </p>`
            }
        },

        seleccionarElemento(index){
            this.desubrayarTexto()
            this.elementoFinal = index
            var elementoDesplazable = document.getElementById(this.elementoInicio);
            // Hacer scroll hacia abajo al elemento desplazable
            elementoDesplazable.scrollTop = elementoDesplazable.scrollHeight;
            const listaParrafos = this.generarListaExtremosYMedios(this.elementoInicio, this.elementoFinal)
            console.log("lista de parrafos",listaParrafos)
            for (let p in listaParrafos){
                console.log(listaParrafos[p])
                const elementos = document.querySelectorAll('[id="'+listaParrafos[p]+'"]');

                // Toggle (alternar) la clase 'subrayado' en cada elemento
                elementos.forEach(elemento => {
                    elemento.classList.toggle('subrayado');
                });
            }
        },   
        desubrayarTexto() {
            // Obtener una lista de todos los elementos con la clase 'subrayado'
            const elementosSubrayados = document.querySelectorAll('.subrayado');
            
            // Iterar sobre cada elemento y eliminar la clase 'subrayado'
            elementosSubrayados.forEach(elemento => {
                elemento.classList.remove('subrayado');
            });
        },
        generarListaExtremosYMedios(primerElemento, ultimoElemento) {
            // Extraer los números de los nombres de los elementos
            const primerNumero = parseInt(primerElemento.split('-')[1]);
            const ultimoNumero = parseInt(ultimoElemento.split('-')[1]);

            // Generar la lista de elementos
            const listaElementos = [];
            for (let i = primerNumero; i <= ultimoNumero; i++) {
                listaElementos.push(`p-${i}`);
            }

            return listaElementos;
        },
        uploadFile(files){
            const file = files[0]

            var reader = new FileReader();

            // Definir una función de flecha para manejar el evento 'load'
            reader.onload = (e) => {
                // Obtener el contenido del archivo XML
                var xmlContent = e.target.result;

                // Crear un nuevo DOMParser
                var parser = new DOMParser();

                // Parsear el contenido XML
                var xmlDoc = parser.parseFromString(xmlContent, "text/xml");
                var children = xmlDoc.getElementsByTagName("text")[0].children;
                let json = this.convertChildrenIntoJSON(children)
                this.saveJSON(json)
                // return json
            }

            reader.readAsText(file);
        },
        async saveJSON(json){
            const result = await this.projectService.saveCorpus(this.id_project,json)
            console.log(result.data._id)
            this.arrayJSON.push({id:result.data._id,data:json})
            this.abrirDialogAddCorpus=false
        },
        convertChildrenIntoJSON(children){
            let JSONres = {}
            for (let child in children){
                let content = children[child]
                
                // let textoLimpio =this.obtenerTextoLimpo(content)
                if(content.id!=undefined){

                    const speaker = this.obtenerTextoLimpo(content.getElementsByTagName("speaker")[0])
                    const oraciones = content.getElementsByTagName("s")
                    
                    JSONres[content.id]=this.limpiarOracionesConOpciones(oraciones)
                    JSONres[content.id]["speaker"]=speaker
                }
                
            }
            return JSONres
        },

        limpiarOracionesConOpciones(oraciones){
            let res = {}
            for (let i=0; i<oraciones.length; i++){
                
                const oracion = oraciones[i]
                const tuid = oracion.getAttribute("tuid")
                res[tuid]= {}
                const oracionExtraida = this.extraerTexto(oracion)
                const nLetras = oracionExtraida.length
                res[tuid]["texto"]=oracionExtraida
                res[tuid]["longitud"]=nLetras

                // Buscar etiquetas add
                res[tuid]["add"] = this.obtenerListaPosicionesAdd(oracion)
                // Buscar etiquetas reform
                res[tuid]["reform"] = this.obtenerListaPosicionesReform(oracion)
            }
            return res
        },

        obtenerListaPosicionesAdd(oracion){
            oracion = oracion.outerHTML.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
            oracion = oracion.replaceAll("<reform>","")
            oracion = oracion.replaceAll("</reform>","")
            const listaLongitudes = this.longitudElementosEntreAdd(oracion)
            const res= []
            if(listaLongitudes.length>0){
                oracion = oracion.replaceAll("</add>","")
                const cachos = oracion.split("<add>")
                    let numeroAnterior = 0
                    for (let nCacho in cachos){
                        const cacho = cachos[nCacho]
                        if(nCacho!=0){
                            res.push([numeroAnterior, numeroAnterior+listaLongitudes[nCacho-1]]) 
                        }
                        numeroAnterior = numeroAnterior+cacho.length
                    }
            }

            return res
        },

        obtenerListaPosicionesReform(oracion){
            oracion = oracion.outerHTML.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
            oracion = oracion.replaceAll("<add>","")
            oracion = oracion.replaceAll("</add>","")
            const listaLongitudes = this.longitudElementosEntreReform(oracion)
            const res= []
            if(listaLongitudes.length>0){
                oracion = oracion.replaceAll("</reform>","")
                const cachos = oracion.split("<reform>")
                    let numeroAnterior = 0
                    for (let nCacho in cachos){
                        const cacho = cachos[nCacho]
                        if(nCacho!=0){
                            res.push([numeroAnterior, numeroAnterior+listaLongitudes[nCacho-1]]) 
                        }
                        numeroAnterior = numeroAnterior+cacho.length
                    }
            }

            return res
        },

        longitudElementosEntreAdd(cadena) {
            let resultados = [];
            let patron = /<add>(.*?)<\/add>/g;
            let coincidencias;
            
            while ((coincidencias = patron.exec(cadena)) !== null) {
                let textoEntreAdd = coincidencias[1];
                resultados.push(textoEntreAdd.length);
            }
            
            return resultados;
        },
        longitudElementosEntreReform(cadena) {
            let resultados = [];
            let patron = /<reform>(.*?)<\/reform>/g;
            let coincidencias;
            
            while ((coincidencias = patron.exec(cadena)) !== null) {
                let textoEntreReform = coincidencias[1];
                resultados.push(textoEntreReform.length);
            }
            
            return resultados;
        },
        obtenerTextoLimpo(elemento) {
            let res = ""
            for (let e in elemento.children){
                let val = elemento.children[e]
                let texto = this.extraerTexto(val)
                if(texto!=""){
                    if(res!=""){
                        res+="\n"
                    }
                    res+=texto
                }
            }
            return res
        },
        extraerTexto(xmlElement) {
            // Si el elemento es un nodo de texto, devolver su valor
            if (xmlElement.nodeType === Node.TEXT_NODE) {
                return xmlElement.nodeValue.trim();
            }
            
            // Si el elemento tiene hijos, procesar recursivamente cada uno
            if (xmlElement.childNodes!=undefined && xmlElement.childNodes.length > 0) {
                let texto = '';
                for (let i = 0; i < xmlElement.childNodes.length; i++) {
                    texto += this.extraerTexto(xmlElement.childNodes[i]) + ' ';
                }
                return texto.trim();
            }
            
            // Si no es un nodo de texto y no tiene hijos, devolver cadena vacía
            return '';
        },

    },
	computed: {
	},
    components: {
    }
}
</script>
<style>
    .parragraph-s{
        display: flex;
        margin-top: 6px;
    }

    .add{
        margin-left: 4px;
        margin-right: 4px;
    }

    pre b{
        font-weight: bold;
    }

    .corpus-intro{
        width: 100%;
        height: calc(100vh - 11.5rem);
        background-size: cover;
    }

    .bloque-instrucciones{
        width: 100%;
        height: 84%;
    }

    .bloque-instrucciones-cabecera{
        width: 100%;
        height: 10%;
        margin-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .bloque-instrucciones-cuerpo{
        width: 100%;
        height: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .instrucciones{
        width: 30%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-; 
        padding-left: 4rem;
        flex-direction: column;
    }

    .instruccion{
        cursor: pointer;
    }

    .instruccion:hover{
        color: #3B58A8;
    }

    .ejemplo{
        width: 70%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center; 
    }

    .card-ejemplo{
        width: 90%;
        height: 90%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center; 
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        background-color: #E0E5F2;
    }

    .subrayado {
      text-decoration: underline;
    }
    
    .bloque-corpus{
        width: 100%;
        height: 16%;
        background-color: #3B58A8;
        border-bottom: 2px solid #000;
        display: flex;
    }

    .bloque-corpus-content {
        flex: 1;
        text-align: center;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        color: black;
    }

    .bloque-cards{
        width: 100%;
        height: 84%;
        background-color: rgb(75, 70, 70);
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .card-corpus{
        width: 32%;
        height: 90%;
        margin-top: 5%;
        margin-bottom: 5%;
        margin-left: 5px;
        margin-right: 5px;
        overflow-y: scroll;
        
        
    }

    .titulo-card{
        width: 100%;
        height: 100%;
        position:relative;
        direction: rtl;
    }

    .boton-eliminar-card{
        opacity: 0;
        transition: opacity 0.3s ease;
        /* display: none; */
        position: absolute;
        top: 225px;
        /* left: 55%; */
        

    }



    .card-corpus:hover .boton-eliminar-card{
        display: block;
        opacity: 1;
        pointer-events: auto;
    }

</style>