<template>
  <div class="article">
    <b-input
      id="inline-form-input-name"
      class="mb-2 mr-sm-2 mb-sm-0 search"
      placeholder="search" v-model="keywords"
    ></b-input>

    <div class="lists">
        <!--列表-->
        <b-container class="bv-example-row">
          <b-row >
              <b-col sm="12" md="6" lg="4" v-for="post in search(keywords)">
                <div class="content" >
									<b-img :src="post.body | takeImage" fluid-grow rounded class="courseimg"></b-img>
                  <div class="title">
                    <span style="font-size: 1.2rem">{{ post.title }}</span><br>
                    <p class="posttime">@{{ post.author }} 　{{ post.created  | formatTime}}</p>
                  </div>
                  <p style="padding: 0 1rem 2.5rem 1rem">{{ post.body | abstractFn }}</p>
									<div class="opensealink">- <a :href="post.body | takeLink" target="_blank" class="openseatext">{{ $t('message.opensea') }}</a> - </div>
                </div>
								
              </b-col>
          </b-row>
        </b-container>

        <div style="clear:both;"></div>
      </div>


    <!--加载动画-->
    <transition name="fade">
      <SmallLoading v-if="isLoading"></SmallLoading>
    </transition>
    <!-- 错误提示弹窗 -->
    <transition name="fade">
      <div class="mask" v-if="showMask" @click="hideMask">
        <div class="mask-box">
          <div class="mask-info">
            <div class="mask-info-text">
              <div v-if="successFlag">
                <img src="../../static/images/success.jpg" class="d-inline-block align-top" alt="success">
              </div>
              <div v-else>
                <img src="../../static/images/error.jpg" class="d-inline-block align-top" alt="error">
              </div>
              {{ maskInfo }} <br>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="btn">
      <b-button variant="outline-primary" @click="getNext">more</b-button>
    </div>
  </div>
</template>

<script>
    import SmallLoading from './SmallLoading'
    export default {
        name: "PhotoNft",
      data(){
          return{
            keywords:'',
            posts:[],
            author:'',
            permlink:'',
            isLoading: true,

            showMask:false,
            maskInfo:"",
            hash: '',

          }
      },
      methods:{
				async getAllusers(){
					await this.getArtInstance()
					let instance = this.$store.state.photoInstance2
					
					//getAllURI(uint256 _id, uint256 _limit)
					let id = 1
					let limit = 2
				
					let xid = await instance.methods.id().call()
					console.log(22, xid, instance) //ownerOf
					// let owner = await instance.methods.ownerOf(id).call()
					// console.log(68, owner)
					
					let users = await instance.methods.getAllOwner().call()
					console.log(688, users)
					
					let uri = await instance.methods.getAllURI().call()
					console.log(689, uri)
					
					let users2 = await instance.methods.getOwnersbyLimit(id, limit).call()
					console.log(6882, users2)
					
					let uri2 = await instance.methods.getURIbyLimit(id, limit).call()
					console.log(6883, uri2)
		
					
				},
        search(keywords){
          let posts = this.posts
          return posts.filter(item => {
            if(item.title.includes(keywords)){
              // console.log(166, '查到了！')
              return item
            }
          })
        },
				larkFilter(data){
					// let tag = "larkarttest"
					return data.filter(item => {
						// if(JSON.parse(item.json_metadata).tags.includes(tag)){
					  if(JSON.parse(item.json_metadata).dapp === "lark"){
					    // console.log(166, '查到了！')
					    return item
					  }
					})
				},

        getCreated(){
            let that = this
            let query = { tag: "larkphotograph", limit : 20 }
            this.hive.api.getDiscussionsByHot(query, function(err, data) {
              // console.log(123, data)
							if(data.length == 0){
								that.isLoading = false
								alert("暂没有作品！")
							}

              // that.posts = that.larkFilter(data)
							that.posts = data
              //取到最后一篇文章的author和Permlink，做为下一次查询的起始点
              that.author = data[data.length - 1].author
              that.permlink = data[data.length - 1].permlink
              //将得到的数据存入vuex中
              that.$store.commit('savePhotoCreated', data)
              that.isLoading = false
            })
          },

        getNext(){
          let that = this
          that.isLoading = true  
          let query = {tag: "larkphotograph", limit: 20, start_author: this.author, start_permlink: this.permlink}
          this.hive.api.getDiscussionsByHot(query, function(err, data) {
            // console.log(43, data)
            if(data.length == 0){
              that.isLoading = false
              alert('没有更多了！')
              return
            }
            data.forEach(post => {
              if (post.permlink != that.permlink) {
                that.posts.push(post)
              }
            })
            //取到最后一篇文章的author和Permlink，做为下一次查询的起始点
            that.author = data[data.length - 1].author
            that.permlink = data[data.length - 1].permlink
            //将得到的数据存入vuex中
            that.$store.commit('savePhotoCreated', that.posts)
            that.isLoading = false
          })
        }
      },

      components: {
        SmallLoading
      },

      mounted() {
        //如果vuex中有值，则直接取出，否则从steem网络中取
        if(this.$store.state.photoCreated != false){
          this.posts = this.$store.state.photoCreated
          this.isLoading = false

          //把初始化的数值补回
          let data = this.$store.state.photoCreated
          this.author = data[data.length - 1].author
          this.permlink = data[data.length - 1].permlink
        }else{
          this.getCreated()
        }
      },

      filters:{
        formatTime(data){
          return data.substring(0,10)
        },
        takeImage(text){
          let reg = /!\[(.*?)\]\((.*?)\)/
          // let reg = /\!\[.*?\)/
          let a = text.match(reg)
          if(a === null){
            return
          }
          return a[2]
        },
				
				takeLink(text){
				  let reg = /https\:\/\/opensea\.io\/assets\/matic\/.*\/[0-9]+/
					//https://opensea.io/assets/matic/
				  let a = text.match(reg)
				  if(a === null){
				    return
				  }
				  return a[0]
				},
        abstractFn(res){
          if(!res){
            return ''
          }else{
            let str=res.replace(/(\*\*|__)(.*?)(\*\*|__)/g,'')          //全局匹配内粗体
                    .replace(/\!\[[\s\S]*?\]\([\s\S]*?\)/g,'')           //全局匹配图片
                    .replace(/\([\s\S]*?\)/g,'')                              //全局匹配连接
                    .replace(/<\/?.+?\/?>/g,'')                             //全局匹配内html标签
                    .replace(/http.*\w/g,'')                              //全局http连接
                    .replace(/(\*)(.*?)(\*)/g,'')                               //全局匹配内联代码块
                    .replace(/`{1,2}[^`](.*?)`{1,2}/g,'')                       //全局匹配内联代码块
                    .replace(/```([\s\S]*?)```[\s]*/g,'')                       //全局匹配代码块
                    .replace(/\~\~(.*?)\~\~/g,'')                               //全局匹配删除线
                    .replace(/[\s]*[-\*\+]+(.*)/g,'')                           //全局匹配无序列表
                    .replace(/[\s]*[0-9]+\.(.*)/g,'')                           //全局匹配有序列表
                    .replace(/(#+)(.*)/g,'')                                    //全局匹配标题
                    .replace(/(>+)(.*)/g,'')                                    //全局匹配摘要
                    .replace(/\r\n/g,"")                                        //全局匹配换行
                    .replace(/\n/g,"")                                          //全局匹配换行
            // .replace(/\s/g,"")                                          //全局匹配空字符;
            return str.slice(0,80)
          }
        }

      },
    }
</script>

<style scoped>

  .article{
    /* margin-top: 3rem; */
    width: 80%;
    margin: 0 auto;
  }
  .lists{
    width: 85%;
    margin: 0 auto;
  }
  .posttime{
    font-size: 0.8rem;
    display: inline;
  }

  .content{
    color: rgba(55,53,58,0.75);
    /* float: left; */
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    /* height: 30rem; */
		height:95%;
    border: 1px solid #ebebeb;
    box-shadow: 3px 3px 2px #ebebeb;
  }


  .content2{
    color: rgba(55,53,58,0.75);
    align: center;
    margin: 3rem auto;
    padding-bottom: 0.5rem;
    width: 50%;
    border: 1px solid #ddd;
    box-shadow: 5px 5px 3px #ebebeb;
    /*background-color: rgba(58,46,52,0.04);*/
  }
  .title{
    text-align: center;
    width: 95%;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
	
 .courseimg{
		max-width: 100%; 
		height: auto;
  }
	
	.opensealink{
		text-align: center;
		margin-bottom: 1rem;
		height: 4rem; 
		padding-top: 1rem;
		padding-left: 3rem;
		padding-right: 3rem;
		position:absolute;
		bottom:0px;
	}
	.openseatext{
		color:#80722f;
	}
  a{
    color: rgba(55,53,58,0.75);
  }

  a:hover{
    color: darkcyan;
    text-decoration: none;
  }

  .btn{
    display: block;
    margin: 0 auto;
    margin-bottom: 1rem;
  }
  .btn-outline-primary {
    color: rgba(55,53,58,0.75);
    border-color: rgba(55,53,58,0.75);
  }
  .btn-outline-primary:hover{
    background-color: chocolate;
    border: none;
  }

  .search{
    margin: 0.5rem auto !important;
    width: 80%;
  }

</style>
