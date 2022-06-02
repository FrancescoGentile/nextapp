<script>
/* 
* Shows informations: description, admins informations, ...
* Shows a subscribe buttons (when first subscribed )
* Shows a list of events (can decide to partecipate if subscribed) and news 
*/
import { defineComponent } from "vue"

export default defineComponent({
    props:["id"]
})
    
</script>

<template>
    <div>
        channel details page id: {{id}}        
    </div>
</template>

<style>
    
</style>