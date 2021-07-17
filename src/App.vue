<template>
<!--  <ViewAndSelector></ViewAndSelector>-->
  <MainPage></MainPage>
</template>

<script>
import ViewAndSelector from './components/ViewAndSelector'
import MainPage from "./components/MainPage";

export default {
  name: 'App',
  components: {
    ViewAndSelector, MainPage
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*height: 100%;*/
  margin-top: 60px;
}
</style>
