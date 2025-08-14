<template>
   <div class="full_container">
      <div class="container">
         <div class="center verticle_center height">
            <div class="error_page">
               <div class="center">
                  <div class="error_icon">
                     <img class="img-responsive" src="@/assets/images/layout_img/error.png" alt="404" />
                  </div>
               </div>
               <br />
               <h3>PÁGINA NÃO ENCONTRADA !</h3>
               <P>A página que você está procurando pode ter sido removida ou temporariamente indisponível</P>
               <div class="center"><router-link :to="{ path: '/' }" class="main_bt">Voltar a Página Inicial</router-link></div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
export default {
   name: 'NotFound'
}
</script>

<style scoped>
.height {
   height: 85vh;
}
</style>