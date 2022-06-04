<script>
import { Modal } from "bootstrap"
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
    components: {
        Datepicker
    },
    props: ["channelId"],
    data() {
        return {
            news: [],
            printableNews: [],
            chosenNews: {},

            users: [],
            user: {},

            minDate: "",
            maxDate: ""
        }
    },
    created() {
        this.minDate = new Date()
        this.maxDate = new Date(new Date().setDate(this.minDate.getDate() + 30));
    },
    computed: {
        loadedNews() {
            return this.$store.getters.getChannelNews
        },
        loadedUsers() {
            return this.$store.getters.getUsers
        },
        loadedUser() {
            return this.$store.getters.getUser
        }
    },
    mounted() {
        this.$store.dispatch("channelNews", this.channelId
        ).then(() => {
            this.news = this.loadedNews
            this.getprintableNews()
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("users"
        ).then(() => {
            this.users = this.loadedUsers
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("publicUser"
        ).then(() => {
            this.user = this.loadedUser
        }).catch(err => {
            console.log(err)
        })
    },

    methods: {
        getPrintableNews() {
            this.printableNews = []
            this.news.forEach(item => {
                let itemDate = new Date(item.date)
                let date = ("0" + itemDate.getDate()).slice(-2) + "/" + ("0" + (itemDate.getMonth() + 1)).slice(-2) + "/" + itemDate.getFullYear()
                let author = this.users.filter(user => user.self === item.author)
                let res = {
                    self: item.self,
                    title: item.title,
                    author: author.first_name + " " + author.middle_name + " " + author.surname,
                    channel: this.channelId,
                    body: item.body,
                    date: date
                }
                this.printableNews.push(res)
            })
        },

        addNews() {
            let title = this.chosenNews.title
            let date = this.chosenNews.date.toISOString()
            let author = this.user.self
            let body = this.chosenNews.body
            let channel = "/api/v2/channels/" + this.channelId

            const news = {
                title, author, date, body, channel
            }
            let id = this.channelId
            this.$store.dispatch("addNews", { news, id }
            ).then(() => {
                this.$store.dispatch("channelNews", this.channelId
                ).then(() => {
                    this.news = this.loadedNews
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.chosenNews = {}
            this.hideModal('addNews')
        },

        deleteNews(news) {
            let newsId = news.self.replace("/api/v2/channels/news" + this.channelId + "/", "")
            let channelId = this.channelId
            this.$store.dispatch("deleteNews", { newsId, channelId }
            ).then(() => {
                this.$store.dispatch("channelNews", this.channelId
                ).then(response => {
                    this.$store.commit("setChannelNews", response.data)
                    this.news = this.loadedNews
                    //console.log(this.users)
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err);
            });
            this.hideModal('deleteNews')
        },

        modifyNews(printableNews) {
            let news = this.news.filter(el => el.self === printableNews.self)
            news.date = news.date.toISOString()
            console.log(news)
            let newsId = news.self.replace("/api/v2/channels/" + this.channelId + "/events", "")
            let channelId = this.channelId
            this.$store.dispatch("modifyNews", { news, newsId, channelId }
            ).then(() => {
                this.$store.dispatch("channelNews", this.channelId
                ).then(response => {
                    this.$store.commit("setChannelNews", response.data)
                    this.news = this.loadedNews
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("modifyNews")
        },

        revertChanges() {
            this.$store.dispatch("channelNews", this.channelId
            ).then(response => {
                this.$store.commit("setChannelNews", response.data)
                this.news = this.loadedNews
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("modifyNews")
        },

        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId)
            const modal = Modal.getInstance(myModalEl)
            modal.hide()
        }
    }
}
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col ">
                <div class="card">
                    <h5 class="card-header">Club news</h5>
                    <div class="card-body">
                        <div class="text-end">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                data-bs-target="#addNews"> Add news </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Title</th>
                                        <th scope="col">Info</th>
                                        <!--author+channel-->
                                        <th scope="col">Date</th>
                                        <th scope="col">Description</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(news, i) in this.printableNews" :key="i">
                                        <th scope="row">{{ i + 1 }}</th>
                                        <td>{{ news.title }}</td>
                                        <td>
                                            <div class="container">
                                                <div class="row">
                                                    <div class="col">{{ news.club }}</div>
                                                </div>
                                                <div class="row">
                                                    <div class="col">{{ news.author }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{ news.date }}</td>
                                        <td>{{ news.body }}</td>
                                        <td>
                                            <button @click="chosenNews = news" class="btn btn-primary"
                                                data-bs-toggle="modal" data-bs-target="#modifyNews"> Modify</button>
                                            <button @click="chosenNews = news" class="btn btn-primary"
                                                data-bs-toggle="modal" data-bs-target="#deleteNews">Delete </button>
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

    <!--modals-->
    <div class="modal fade" id="addNews" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <h1 class="h3 mb-3 fw-normal">Insert news information</h1>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        @click="this.revertChanges()"></button>
                </div>
                <div class="modal-body">
                    <form class="p-4 p-md-5 border rounded-3 bg-light">
                        <div class="form-floating mb-3">
                            <input v-model="chosenNews.title" type="text" class="form-control" placeholder="Title">
                            <label for="floatingInput">Title</label>
                        </div>
                        <div class="form-floating mb-3">
                            <Datepicker v-model="this.chosenNews.date" placeholder="Select date" :cleareble="true"
                                :enableTimePicker="false" @update:modelValue="this.chosenNews.date = modelValue"
                                :minDate="minDate" :maxDate="maxDate" />
                            <label for="floatingInput">Total Seats</label>
                        </div>
                        <div class="form-floating mb-3">
                            <textarea v-model="chosenNews.body" class="form-control" placeholder="details"
                                rows="5"></textarea>
                            <label for="floatingInput">Description</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.revertForm()">Close</button>
                    <button type="button" class="btn btn-primary" @click="addNews()">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="deleteNews" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete news</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this news? This action will be permanent.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="deleteNews(this.chosenNews)">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modifyNews" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Change news information</h5>

                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="col-form-label">Title</label>
                            <input type="text" class="form-control" v-model="chosenNews.title">
                        </div>
                        <div class="mb-3">
                            <div class="form-floating mb-3">
                                <Datepicker v-model="this.chosenNews.date" placeholder="Select date" :cleareble="true"
                                    :enableTimePicker="false" @update:modelValue="this.chosenNews.date = modelValue"
                                    :minDate="minDate" :maxDate="maxDate" />
                                <label for="floatingInput">Total Seats</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="col-form-label">Description</label>
                            <textarea type="text" class="form-control" v-model="chosenNews.body"
                                rows="5"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="revertChanges(this.chosenNews)">Close</button>
                    <button type="submit" class="btn btn-primary" @click="modifyNews(this.chosenNews)">Confirm changes</button>
                </div>

            </div>
        </div>
    </div>

</template>

<style>
</style>