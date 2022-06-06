<script>
import { defineComponent } from "vue";
export default defineComponent({

})
</script>

<template>
    <div class="container">
        <div class="row"> <br><br></div>
        <div class="row">
            <div class="col-1"></div>
            <div class="col">
                <h3 class="text-center mb-3">You need to log in before accessing the resource</h3>
                <div class="text-center">
                    <button @click="this.$router.push('/')" class="btn btn-primary">
                        Go to homepage
                    </button>
                </div>

            </div>
            <div class="col-1"></div>
        </div>
    </div>

</template>
