<script>
import { defineComponent } from "vue"
export default defineComponent({
    props: ["channelId", "channelName"],

    data() {
        return {
            news: [],
            printableNews: []
        }
    },

    computed: {
        loadedNews() {
            return this.$store.getters.getChannelNews
        }
    },

    mounted() {
        this.$store.dispatch("channelNews", this.channelId
        ).then(() => {
            this.news = this.loadedNews;
            this.getPrintableNews()
        }).catch(err => {
            console.log(err)
        })
    },

    methods: {
        getPrintableNews() {
            this.printableNews = []
            this.news.forEach(item => {
                let itemDate = new Date(item.date)
                let date = ("0" + itemDate.getDate()).slice(-2)
                let month = itemDate.toLocaleString("default", { month: "long" })
                let res = {
                    self: item.self,
                    title: item.title,
                    channel: this.channelName,
                    body: item.body,
                    date: date,
                    month: month,
                }
                this.printableNews.push(res)
            })
        }
    }

    

})
</script>

<template>
    <div class="event-schedule-area-two bg-color pad100 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade active show" id="home" role="tabpanel">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th class="text-center" scope="col">Date</th>
                                            <th scope="col">Info</th>
                                            <th scope="col">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="news in this.printableNews" :key="news.self">
                                            <th scope="row">
                                                <div class="event-date">
                                                    <span> {{ news.date }} </span>
                                                    <p> {{ news.month }} </p>
                                                </div>
                                            </th>
                                            <td>
                                                <div>
                                                    <h3> {{ news.title }} </h3>
                                                    <div>
                                                        <div> {{ news.club }} </div>
                                                        <div> {{ news.author }} </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span> {{ news.body }} </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style>
</style>