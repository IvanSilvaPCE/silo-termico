<template>
   <div>
      <div class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <h2>Notificação push</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="white_shd full margin_bottom_30">
         <div class="map_section padding_infor_info">
            <div class="map m_style1">
               <b-row>
                  <b-col>
                     <b-button variant="outline-primary" @click="subscribe()">Subscribe</b-button>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <p class="mt-2">{{ this.pushObject }}</p>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <b-form-group label="Endpoint">
                        <b-form-textarea rows="5" v-model="endpoint"></b-form-textarea>
                     </b-form-group>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <b-button variant="outline-primary" @click="send()" :disabled="!this.endpoint">Send</b-button>
                  </b-col>
               </b-row>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'PushView',
   data() {
      return {
         pushObject: null,
         endpoint: null
      }
   },

   methods: {
      async subscribe() {
         // Verifica se o navegador suporta notificações
         if ('Notification' in window && 'serviceWorker' in navigator) {
            let permission = Notification.permission

            // Se a permissão ainda não foi concedida, solicita ao usuário
            if (permission === 'default') {
               permission = await Notification.requestPermission()
            }

            // Se a permissão foi concedida, registra o service worker e faz a inscrição
            if (permission === 'granted') {
               try {
                  let sw = await navigator.serviceWorker.ready
                  let push = await sw.pushManager.subscribe({
                     userVisibleOnly: true,
                     applicationServerKey: 'BPwHFYVpEjTGxIwSG94yU5vOxe8SO9VcYBCb4gvN3DTqrymZoCcjEOEcL23ICxpKOmFG-7BA9rKM_GYQoX-mO_8'
                  })

                  this.pushObject = JSON.stringify(push)
                  console.log(this.pushObject)
               } catch (error) {
                  console.error('Falha ao se inscrever para notificações push', error)
               }
            } else {
               console.warn('Permissão para notificações não concedida')
            }
         } else {
            console.warn('Navegador não suporta notificações ou service workers')
         }
      },
      async send() {
         const result = await client.post(`/sendpush?endpoint=${this.endpoint}`)

         if (result.status == 200) {
            this.$bvToast.toast('Enviado com sucesso', {
               title: 'Sucesso',
               toaster: 'b-toaster-bottom-right',
               variant: 'success',
               autoHideDelay: 3000,
               solid: false
            })
         }
      }
   }
}
</script>

<style>
</style>