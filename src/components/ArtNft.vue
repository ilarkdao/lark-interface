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
									<b-img :src="post.image" fluid-grow rounded class="courseimg"></b-img>
                  <div class="title">
                    <span style="font-size: 1.2rem">{{ post.name }}</span><br><p class="posttime"><span style="margin-right: 0.7rem">@{{post.attributes[0].value}}</span>   
										{{timeFormat(post.attributes[1].value)}} </p> 
                  </div>
                  <p style="padding: 0 1rem 2.5rem 1rem">{{ post.description | abstractFn }}</p>
									<div class="opensealink">- <a :href=openseaLink+post.id target="_blank" class="openseatext">{{ $t('message.opensea') }}</a> - </div>
                </div>
								
              </b-col>
          </b-row>
        </b-container>
				<div class="btn" v-if="!isLoading">
					<b-button variant="outline-primary" @click="getmoreURI">查看更多</b-button>
				</div>

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
  </div>
</template>

<script>
    import SmallLoading from './SmallLoading'
    export default {
      name: "ArtNft",
      data(){
          return{
            keywords:'',
            posts:[],
						limit: 6,
						currentID: '',
            author:'',
            permlink:'',
            isLoading: true,

            showMask:false,
            maskInfo:"",
            hash: '',

          }
      },
      methods:{
				async getAllURI(){
					let instance = this.$store.state.artInstance2	
					let uri = await instance.methods.getAllURI().call()			
					let work = []
					for(let i = 0; i < uri.length; i ++){					
						// this.getContent(uri[i].slice(-46))
						let res = await this.getContent(uri[i].slice(-46))
						res.id = i
						work.push(res)
					}
					console.log(99, work)
					
					this.posts = work.reverse()
				
					//将得到的数据存入vuex中
					this.$store.commit('saveCreated', this.posts)
				},
				
				async getURIbyLimit(){
					let instance = this.$store.state.artInstance2	
					let id = await instance.methods.id().call()
					console.log(22, "id", id) 
					// let owner = await instance.methods.ownerOf(id).call()
					// // console.log(68, owner)
					
					// // getURIbyLimit(uint256 _id, uint256 _limit)
					let uri = await instance.methods.getURIbyLimit(id-1, this.limit).call()
					this.currentID = id - 1 - this.limit
		
					let work = []
					for(let i = 0; i < uri.length; i ++){					
						let res = await this.getContent(uri[i].slice(-46))
						res.id = i + this.currentID + 1
						work.push(res)
					}				
					this.posts = work.reverse()			
					//将得到的数据存入vuex中
					this.$store.commit('saveCreated', this.posts)
				},
				async getmoreURI(){
					this.isLoading = true
					if(this.currentID <= 0){
						console.log(559, this.currentID)
						alert('没有更多了！')
						this.isLoading = false
						return
					}
					let instance = this.$store.state.artInstance2	

					let uri = await instance.methods.getURIbyLimit(this.currentID, this.limit).call()
					if(uri.length == 0){
						alert('没有更多了！')
						this.isLoading = false
						return
					}
					
					let a = this.currentID - this.limit
					a >= 0 ? this.currentID = a : this.currentID = 0
						
					let work = []
					for(let i = 0; i < uri.length; i ++){					
						let res = await this.getContent(uri[i].slice(-46))
						res.id = i + this.currentID 
						work.push(res)
					}
					
					this.posts = this.posts.concat(work.reverse())
					//将得到的数据存入vuex中
					this.$store.commit('saveCreated', this.posts)
					
					this.isLoading = false
				},
				utf8ArrayToStr(array) {
				  let out, i, len, c
				  let char2, char3
				  out = ""
				  len = array.length
				  i = 0
				  while(i < len) {
				      c = array[i++]
				      switch(c >> 4)
				      {
				          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				          // 0xxxxxxx
				          out += String.fromCharCode(c)
				          break
				          case 12: case 13:
				          // 110x xxxx   10xx xxxx
				          char2 = array[i++]
				          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
				          break
				          case 14:
				              // 1110 xxxx  10xx xxxx  10xx xxxx
				              char2 = array[i++];
				              char3 = array[i++];
				              out += String.fromCharCode(((c & 0x0F) << 12) |
				                  ((char2 & 0x3F) << 6) |
				                  ((char3 & 0x3F) << 0))
				              break
				      }
				  }
				  return out
				},
				async getContent(hash){
					for await (const chunk of this.ipfs.cat(hash)) {
						return JSON.parse(this.utf8ArrayToStr(chunk))
					}
				},
				search(keywords){
				  let posts = this.posts
				  return posts.filter(item => {
				    if(item.name.includes(keywords)){
				      // console.log(166, '查到了！')
				      return item
				    }
				  })
				},
        
        
      },

      components: {
        SmallLoading
      },
			mounted() {
			  let that = this
			  let instance = this.$store.state.artInstance2
			  async function main(){
			    if(Object.keys(instance).length === 0){
			      //如果刷新页面, instance未定义
			      // console.log(888, "instance为空，是刷新页面")
			      await that.getArtInstance()
						// await that.getLarkInstance()
						await that.getURIbyLimit()
			      that.isLoading = false
			    } else{
						// console.log(444, "切换页面")				
						if(that.$store.state.created != false){
							that.posts = that.$store.state.created
							that.isLoading = false
						}else{
							await that.getURIbyLimit()
							that.isLoading = false
						}
						
			    }
			
			  }
			  main()
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
