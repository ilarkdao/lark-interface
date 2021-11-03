<template>
  <div class="wallet">
    <div>
      <div class="changebox">
        <h5>{{ $t('message.userlogin') }}</h5>
      </div>

      <!-- hive -->
      <div class="round-box">
        <div class="round-box-title-container">
          <p class="box-title">
            <img class="coin-icon" src="../../static/images/keychain.png" alt="hive">
          </p>
          <p class="box-title">
            <b-input
              class="mb-2 mr-sm-2 mb-sm-0 user"
              :placeholder="$t('message.steemAccoutPlaceHolder')" v-model="username"
            ></b-input>
          </p>
        </div>
      </div>

      <!-- polygon -->
      <div class="round-box">
        <div class="round-box-title-container">
          <p class="box-title">
            <img class="coin-icon" src="../../static/images/metamask.png" alt="polygon">
          </p>
          <p class="box-title">
            {{ addr }}
          </p>
        </div>
      </div>

      <div class="loginbtn">
        <b-button variant="outline-primary" @click="login" :disabled="!loadingFlag">{{ $t('message.login') }}</b-button>
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
              {{ maskInfo }}
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
    name: "Login",
    data() {
      return {
        username:'',
        addr: '',
        isLoading: true,
        loadingFlag: false,
        keychainFlag: true,
        tronlinkFlag: true,
        showMask:false,
      }
    },
    methods:{
      login(){
        this.loadingFlag = false
        if(this.addr !== '' && this.username !== ''){
          let username = this.username
          let message = `lark_login-${Math.floor(100000000 + Math.random() * 900000000)}`
          let key_type = 'Posting'
          hive_keychain.requestSignBuffer(username, message, key_type, response => {
            // console.log(136, response)
            if (response.success === true) {
              // If user is already logged in
              console.log(' Welcome.', username)
              this.$store.commit('saveUser', {username: username, addr: this.addr})
              this.loadingFlag = true
              this.$router.push({path:'/'})
            } else {
              //  Verification failed
              alert(this.$t('message.hiveloginer')+"\n"+response.message)
              this.loadingFlag = true
            }
          })
        }else{
          this.loadingFlag = true
          alert(this.$t('message.needkeychain'))
        }
      },
    },
    components: {
      SmallLoading
    },

    mounted() {
      let that = this
      async function main(){
        await that.sleep()
        //keychain
        if(window.hive_keychain) { //window.hive_keychain
          // hive Keychain extension installed...
          // console.log(123, "hive-keychain", window.hive_keychain)
        } else {
          that.keychainFlag = false
        }
        //metamask
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        that.addr = accounts[0]

        that.isLoading = false
        that.loadingFlag = true

        //如果有一个没有获取到则再获取一次
        if(!that.keychainFlag){
          that.isLoading = true
          await that.sleep()
          //keychain
          if(window.hive_keychain) {
            // hive Keychain extension installed...
            // console.log(523, "hive-keychain", window.hive_keychain)
          } else {
            // hive Keychain extension not installed...
            console.log(444, "未安装hive-keychain！")
            let link = 'Chrome: https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep\n\n'
            alert(that.$t('message.needkeychain') +"\n\n"+link)
          }
          //tronlink
          let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
          that.addr = accounts[0]

        }
        that.isLoading = false
        that.loadingFlag = true
      }
      main()
    }

  }
</script>

<style scoped>
  .wallet{
    width: 50rem;
    max-width: 520px;
    min-width: 400px;
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

  .changebox p{
    font-weight: 400;
    color: darkgray;
    font-size: 1.2rem;
    cursor: pointer;
  }


  .changebox p:hover{
    color: rgb(92, 91, 91) !important;
  }



  .round-box{
    border-radius: 20px;
    border: 1px solid rgb(247, 248, 250);
    padding:8px 14px;
    margin: 0 auto;
    width: 28rem;
  }

  .round-box-title-container{
    display: flex;
    flex-flow: row nowrap;
    -webkit-box-align: center;
    align-items: center;
    color: rgb(0, 0, 0);
    font-size: 0.75rem;
    line-height: 1rem;;
    box-sizing: border-box;
    justify-content: space-between;
    -webkit-box-pack: justify;
    height: 100%;
    margin-bottom: 1rem;
  }

  .box-title{
    box-sizing: border-box;
    margin: 0px;
    min-width: 0px;
    font-weight: 500;
    font-size: 14px;
    color: rgb(86, 90, 105);
  }


  .coin-icon{
    margin-top: 15px;
    height:45px;
  }


  .user{
    margin-top: 15px;
    width:19rem;
  }
  .loginbtn{
    text-align: center;
    margin-top: 1rem;
  }

  .loginbtn:disabled{
    color: gray;
    cursor: auto;
    box-shadow: none;
    outline: none;
    opacity: 1;
    background-color: rgb(237, 238, 242);
  }

</style>

