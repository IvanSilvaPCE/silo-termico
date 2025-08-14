<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <h2>Configurar equipamento</h2>
               </div>
            </div>
         </div>
         <div class="col-md-12">
            <div class="white_shd full margin_bottom_30">
               <div class="table_section padding_infor_info">
                  <b-row>
                     <b-col>
                        <div class="text-success" v-if="jsonValido">O JSON é válido</div>
                        <div class="text-danger" v-else>O JSON não é válido</div>
                        <b-form-textarea v-model="jsonString" :state="jsonValido" placeholder="Insira o JSON..." rows="12"></b-form-textarea>
                     </b-col>
                  </b-row>
                  <b-row>
                     <b-col>
                        <b-button variant="outline-primary" class="mt-2" @click="formataValidaJSON" :disabled="!jsonString"> Validar </b-button>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
export default {
   name: 'ConfiguraEquipamentoView',
   data() {
      return {
         jsonString: '',
         jsonValido: false
      }
   },
   methods: {
      formataValidaJSON() {
         this.jsonString = this.formataJSON()
         try {
            JSON.parse(this.jsonString)
            this.jsonValido = true
         } catch (error) {
            this.jsonValido = false
         }
      },
      formataJSON() {
         try {
            const parsed = JSON.parse(this.jsonString)
            return JSON.stringify(parsed, null, 3)
         } catch (error) {
            return this.jsonString
         }
      }
   }
}
</script>

<style>
</style>