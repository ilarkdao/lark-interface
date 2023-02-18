<template>
  <div id="maintop">
    <div>		
		  <h3 class="arttitle"> {{ $t('message.photoNft') }}</h3>
      <b-input
        class="mb-2 mr-sm-2 mb-sm-0 title"
        :placeholder="$t('message.nftTitle')" v-model="name"
      ></b-input>
      
      <b-form-file :placeholder="$t('message.upload')+' (.jpg, .jpeg, .png, .webp, .gif)'" 
        :browse-text="$t('message.file')" v-model="file" 
        class="title" accept=".jpg, .jpeg, .png, .webp, .gif" 
        >
      </b-form-file>
      <div v-if="file != false"> {{addImage}}</div>

      <!--加载动画-->
      <transition name="fade">
        <SmallLoading v-if="isLoadingFile"></SmallLoading>
      </transition>

      <div v-if="imgHash">
				<b-img :src="ipfs_host+imgHash" :alt="name" fluid-grow rounded style="padding-bottom:0.6rem;"></b-img>
         {{ $t('message.workHash') }} (IPFS) : {{ imgHash }}
      </div>
      

      <b-form-textarea
        class="title"
        v-model="content"
        :placeholder="$t('message.description')"
        rows="6"
        max-rows="12"
      ></b-form-textarea>
			
			<b-form-group>
				<b-form-checkbox-group
					id="checkbox-group-1"
					v-model="selected"
					:options="options"
					name="flavour-1"
				></b-form-checkbox-group>
			</b-form-group>
			
			<div>mintFee: {{mintFee}} LARK</div>

      <div class="abtn">
        <div class="postbtn">
					<b-button v-if="!isApprove" variant="outline-primary"
					          style="margin-right:1rem;width:8rem;"
					          @click="letApprove"
					          :disabled="!approveFlag"
					>
					  {{ $t('message.approve') }}
					</b-button>
         <b-button variant="outline-primary" @click="post" 
					 :disabled="!flag || !isApprove || !upImageFlag"
				 >
					{{ $t('message.postPhotoNft') }}
				 </b-button><br>
        </div>
        <br>
      </div>

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
      name: "CreatePhotoNft",
      data() {
        return {
          name: '',
          content: '',
          file:[],
          imgHash: '',
          ipfs_host:"https://ipfs.ilark.io/ipfs/",
					
					balanceOfLark: '',
					allowance: '',

          flag: false,
          successFlag:true,
          approveFlag: true,

          isLoading: true,
          isLoadingFile: false,
					upImageFlag: false,
					
					selected: ['hive'], // Must be an array reference!
					options: [
						{ text: this.$t('message.postToHive'), value: 'hive' }
					],

          showMask:false,
          maskInfo:"",
          hash: '',

        }
      },

      methods: {
        async waiting(){
          return new Promise(resolve => {
            // console.log(11, "start")
            setTimeout(resolve, 3000)  //3秒
            // console.log(22, "end")
          })
        },

        readFile(file){
          this.isLoadingFile = true
          return new Promise(resolve => {
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (event) => {
							resolve(Buffer.from(event.target.result))
            }
          })
        },
				async upImage(file){
					let content = await this.readFile(file)
					let res = await this.ipfs.add(content)
					this.imgHash = res.path
					this.isLoadingFile = false
					this.upImageFlag = true
					// console.log(88, res)
				},
				
				async getBalanceAndAllowance(){
					let instance = this.$store.state.larktokenInstance2
				  let addr = this.$store.state.addr
				  let v = await instance.methods.balanceOf(addr).call()
				  this.balanceOfLark = this.web4.utils.fromWei(v, "ether")
				
				  let t = await instance.methods.allowance(addr, this.larkPhotoNFT).call()
				  this.allowance = this.web4.utils.fromWei(t, "ether")
				  // console.log(366, "allowance", this.allowance)
				},
				
        async letApprove(){
					await this.unlockWallet()
          this.approveFlag = false
          this.isLoading = true
					
        	let instance = this.$store.state.larktokenInstance
          let p = await this.web4.eth.getGasPrice()
          let addr = this.$store.state.addr
          let gasPrice = parseFloat(p) + this.addGas
          let option = {
            from: addr,
            gasPrice: gasPrice
          }
          let amount = this.web4.utils.toWei('8000000000', 'ether')
          await instance.methods.approve(this.larkPhotoNFT, amount).send(option)
        
          await this.sleep()
          await this.getBalanceAndAllowance()
          this.isLoading = false
        },

        async post(){
          await this.unlockWallet()
          if(this.name !== '' && this.content !== '' && this.imgHash !== ''){
            if(parseFloat(this.balanceOfLark) >= parseFloat(this.mintFee) ){
              this.flag = false
              this.isLoading = true
              let author = this.$store.state.username
              let addr = this.$store.state.addr
              let instance = this.$store.state.photoInstance

              let metaDate = {
                "name": this.name,
                "description": this.content,
                "external_url": "https://hive.blog/@"+author,
                "image": this.ipfs_host+this.imgHash,
                "attributes": [
                  {
                    "trait_type": "author",
                    "value": author
                  },
                  {
                    "display_type": "date",
                    "trait_type": "created",
                    "value": Date.parse(new Date()) * 1e-3
                  }
                ]
              }
     
							try{
								//上传IPFS
								let data = Buffer.from(JSON.stringify(metaDate))
								let res = await this.ipfs.add(data)
								let tokenURI = this.ipfs_host+res.path
								let p = await this.web4.eth.getGasPrice()
								let gasPrice = parseFloat(p) + this.addGas
								let option = {
									from: addr,
									gasPrice: gasPrice
								}
								let minters = await instance.methods.createArtNFT(tokenURI).send(option) 
								let id = minters.events.Transfer.returnValues.tokenId
								// console.log(1233, id) //minters.events.Transfer.returnValues.tokenId

								//上传内容到hive
								if(this.selected.includes('hive')){	
									let parentAuthor = ''
									let parentPermlink = 'larkphotograph'
									let title = this.name
									let permlink = this.getstr()
									let tail = '\n\n\n -> [OpenSea Sell/Buy](https://opensea.io/assets/matic/'+this.larkPhotoNFT+'/'+id+')'
									let image = "![]("+this.ipfs_host+this.imgHash+")"+"\n\n"
									let body = image+this.content + tail
									let tags = ["larkphotograph","nft","photograph","polygon","web3"]
									let jsonMetadata = {"tags": tags, "dapp": "lark", "format": "markdown"}
									let req = await this.postToHive(parentAuthor, parentPermlink, author, permlink, title, body, JSON.stringify(jsonMetadata))
									if(req.success === true) {
										await this.sleep()
										await this.sleep()
										this.$store.state.photoCreated = []
										this.$router.push({path: '/photograph'})
										// this.$router.go(0)
									}	else{
										this.showMask = true
										this.successFlag = false
										this.maskInfo = "错误！\n"+req.message
									}
								}else{
								 this.$router.push({path: '/photograph'})
							 }
							}catch (e) {
								this.showMask = true
								this.maskInfo = "出错啦！\n 刷新后重试！具体原因如下：\n" + e
								this.successFlag = false
								this.isLoading = false
							}
            }else{
              this.showMask = true
              this.successFlag = false
              this.maskInfo = "您的LARK余额不足！"
            }
          }else{
            this.showMask = true
            this.successFlag = false
            this.maskInfo = "名称、描述、作品哈希等不能为空！"
          }
          },
  
        hideMask(){
          this.showMask=false
        },

      },

      components: {
        SmallLoading
      },

      computed: {
        addImage() {
          // console.log(123,this.file, this.file == false, this.file != false)
          if(this.file != false){
            this.upImage(this.file)
          } 
        },
				isApprove() {
					console.log("isApprove", parseFloat(this.allowance) >= this.mintFee)
					return parseFloat(this.allowance) >= this.mintFee
				}
    },

      mounted() {
        let that = this
        async function main(){
            await that.getArtInstance()
        		await that.getLarkInstance()
            await that.getBalanceAndAllowance()
            that.isLoading = false
            that.flag = true
        }
        main()
      },
    }
</script>

<style scoped>
  #maintop{
    width: 50rem;
    margin: 2.5rem auto;
    padding: 1.5rem 1rem 2rem 1rem;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 3px 30px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 3px 16px 24px, rgba(0, 0, 0, 0.01) 3px 24px 32px;
    border-radius: 30px;
    display: block;
    z-index: 1;
    box-sizing: border-box;
  }
	
	.changebox{
	    display: flex;
	    justify-content: space-evenly;
	    padding: 1em;
	}
	
	.arttitle{
		text-align: center;
	}

  .title{
    margin-top: 1rem;
    margin-bottom: 1rem !important;
    /* width: 60%; */
  }
  .content{
    margin-top: 1.5rem;
    margin-bottom: 1.5rem !important;
    width: 60%;
    background-color: bisque;
    position:relative;
    z-index: 100;
  }

    
  .abtn{
    margin-top: 0.3rem;
  }
	.postbtn{
		text-align: center;
	}
  

  .isok{
    /*margin-top: 1.5rem;*/
    /*width: 50%;*/
    /*background-color: chartreuse;*/
  }
  .isfalse{
    /*margin-top: 1.5rem;*/
    /*width: 50%;*/
    background-color: crimson;
  }



</style>
