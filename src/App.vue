<template>
  <div id="app">
    <b-navbar toggleable="lg" type="light" variant="info" id="navmanu">
      <b-navbar-brand @click="backtoindex">
          <img src="../static/images/logo.svg" class="d-inline-block align-top" alt="lark">
      </b-navbar-brand>

      <div class="logos" v-if="$store.state.username ">
          <span style="margin-right: 1rem" @click="mywallet">
            <img class="account-icon" src="../static/images/hive.svg" alt="hive">@{{ $store.state.username }}
          </span>
          <span @click="mywallet">
            <img class="account-icon" src="../static/images/polygon.svg" alt="polygon">{{$store.state.addr | formatAddr}}
          </span>
      </div>
      <br>

      <!--模块-->
      <div class="module">
				<span class="module-title" :class="moduleIndex === '1' ? 'active': 'noActive'" @click="artNft">NFT</span>
        <span class="module-title" :class="moduleIndex === '2' ? 'active': 'noActive'" @click="pools">{{ $t('message.pools') }}</span>
				<span class="module-disable">{{ $t('message.bounty') }}</span>
        <span class="module-disable">{{ $t('message.staking') }}</span>
        <span class="module-disable">DAO</span>
      </div>
      <!--//模块-->

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
				<!-- 切换模块 nft-->
				<b-navbar-nav class="ml-auto" style="display:block" v-if="moduleIndex === '1'">
				  <div class="loginfo">
						<button class="right-item" @click="artNft">{{ $t('message.nftWork') }}</button>
						<button class="right-item" @click="photoNft">{{ $t('message.photoWork') }}</button>
						
						<div class="drop">
						    <b-dropdown id="dropdown-grouped" :text="this.$t('message.post')" variant="transparent" class="m-2">
						    <b-dropdown-item-button @click="nft">
						      {{ $t('message.postNft') }}
						    </b-dropdown-item-button>
						    <b-dropdown-divider></b-dropdown-divider>
						    <b-dropdown-item-button @click="postPhoto">
						      {{ $t('message.postPhotoNft') }}
						    </b-dropdown-item-button>
						  </b-dropdown>
						</div>
						
				    <div class="drop">
				        <b-dropdown id="dropdown-grouped" :text="this.$t('message.language')" variant="transparent" class="m-2">
				        <b-dropdown-item-button @click="setzhlang">
				          {{ $t('message.zh') }}
				        </b-dropdown-item-button>
				
				        <b-dropdown-divider></b-dropdown-divider>
				        <b-dropdown-item-button @click="setenlang">
				          {{ $t('message.en') }}
				        </b-dropdown-item-button>
				      </b-dropdown>
				    </div>
				
				    <div class="drop">
				          <b-dropdown id="dropdown-grouped" :text="this.$t('message.about')" variant="transparent" class="m-2">
				
				          <b-dropdown-item-button>
				            <a target="_blank" href="#">{{ $t('message.docs') }}</a>
				          </b-dropdown-item-button>
				           <b-dropdown-divider></b-dropdown-divider>
				
				          <b-dropdown-item-button>
				            <a target="_blank" href="https://github.com/ilarkdao">Github</a>
				          </b-dropdown-item-button>
				           <b-dropdown-divider></b-dropdown-divider>
				
				          <b-dropdown-item-button>
				            <router-link to="/contract">{{ $t('message.contract') }}</router-link>
				          </b-dropdown-item-button>
				           <b-dropdown-divider></b-dropdown-divider>
				          <b-dropdown-item-button>
				             <router-link to="/delegatorlists">{{ $t('message.delegatorList') }}</router-link>
				          </b-dropdown-item-button>
				          <b-dropdown-divider></b-dropdown-divider>
				          <b-dropdown-item-button>
				            <a target="_blank" href="https://discord.gg/p9KTdmVrfb">Discord</a>
				          </b-dropdown-item-button>
				
				      <div v-if="$store.state.username">
				          <b-dropdown-divider></b-dropdown-divider>
				          <b-dropdown-item-button @click="logout" style="text-align:center">
				            {{ $t('message.logout') }}
				          </b-dropdown-item-button>
				      </div>
				        </b-dropdown>
				    </div>
				
				  </div>
				</b-navbar-nav>
				<!-- 切换模块 nft-->
				
        <!-- 切换模块 pool-->
        <b-navbar-nav class="ml-auto" style="display:block" v-if="moduleIndex === '2'">
          <div class="loginfo">
            <button class="right-item" @click="pools">{{ $t('message.delegatemine') }}</button>
						<div v-if="devTeam.includes($store.state.addr)" style="margin-right: 0.5rem;">
							<button class="right-item" @click="dev">Dev</button>
						</div>
            <!-- <button class="right-item" @click="slpfarm">{{ $t('message.farm') }}</button> -->
						
            <div class="drop">
                <b-dropdown id="dropdown-grouped" :text="this.$t('message.language')" variant="transparent" class="m-2">
                <b-dropdown-item-button @click="setzhlang">
                  {{ $t('message.zh') }}
                </b-dropdown-item-button>

                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item-button @click="setenlang">
                  {{ $t('message.en') }}
                </b-dropdown-item-button>
              </b-dropdown>
            </div>

              <div class="drop">
                  <b-dropdown id="dropdown-grouped" :text="this.$t('message.about')" variant="transparent" class="m-2">

                   <!-- <b-dropdown-item-button @click="mywallet">
                     <router-link to="/wallet">{{ $t('message.mywallet') }}</router-link>
                  </b-dropdown-item-button> -->

                  <b-dropdown-item-button>
                    <a target="_blank" href="#">{{ $t('message.docs') }}</a>
                  </b-dropdown-item-button>
                   <b-dropdown-divider></b-dropdown-divider>

                  <b-dropdown-item-button>
                    <a target="_blank" href="https://github.com/ilarkdao">Github</a>
                  </b-dropdown-item-button>
                   <b-dropdown-divider></b-dropdown-divider>

                  <b-dropdown-item-button>
                    <router-link to="/contract">{{ $t('message.contract') }}</router-link>
                  </b-dropdown-item-button>
                   <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item-button>
                     <router-link to="/delegatorlists">{{ $t('message.delegatorList') }}</router-link>
                  </b-dropdown-item-button>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item-button>
                    <a target="_blank" href="https://discord.gg/p9KTdmVrfb">Discord</a>
                  </b-dropdown-item-button>

              <div v-if="$store.state.username">
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item-button @click="logout" style="text-align:center">
                    {{ $t('message.logout') }}
                  </b-dropdown-item-button>
              </div>
                </b-dropdown>
            </div>

          </div>
        </b-navbar-nav>
        <!-- 切换模块 pool-->

        
      </b-collapse>
    </b-navbar>

    <router-view/>

  </div>
</template>

<script>
  export default {
    name: 'App',
    data(){
      return {
        moduleIndex: localStorage.getItem('moduleIndex'),

      }
    },
    methods: {
      backtoindex(){
        this.moduleIndex = '1'
        let moduleIndex = 'moduleIndex'
        localStorage.setItem(moduleIndex, '1')

        this.$router.push({path: '/'})
      },
			artNft(){
				this.moduleIndex = '1'
				let moduleIndex = 'moduleIndex'
				localStorage.setItem(moduleIndex, '1')
			  this.$router.push({path: '/'})
			},

			photoNft(){
			  this.$router.push({path: '/photograph'})
			},
			nft(){
			  this.$router.push({path: '/art'})
			},
			postPhoto(){
			  this.$router.push({path: '/createphoto'})
			},
			
      pools(){
        this.moduleIndex = '2'
        let moduleIndex = 'moduleIndex'
        localStorage.setItem(moduleIndex, '2')
        this.$router.push({path: '/pool'})
      },
      
      slpfarm(){
        this.$router.push({path: '/farm'})
      },
			dev(){
			  this.$router.push({path: '/dev'})
			},
      mywallet(){
        this.$router.push({path: '/wallet'})
      },

      logout(){
        this.$store.commit('clearUser')
        this.$router.push({path:'/login'})
      },

      setzhlang(){
        let LOCALE_KEY = 'localeLanguage'
        let lang = 'zh-CN'
        localStorage.setItem(LOCALE_KEY, lang)
        this.$i18n.locale = 'zh-CN'
      },
      setenlang(){
        let LOCALE_KEY = 'localeLanguage'
        let lang = 'en'
        localStorage.setItem(LOCALE_KEY, lang)
        this.$i18n.locale = 'en'
      }
    },
    components: {

    },
    filters:{
      formatAddr(data){
        return data.substring(0,6)+'...'+data.substring(38)
      },

    },
    mounted() {
      //初始化
      let moduleIndex = 'moduleIndex'
      if(localStorage.getItem(moduleIndex) == null){
        localStorage.setItem(moduleIndex, '1')
      }

      // console.log(125, "url", this.$route.path)
      if(this.$route.path === '/'){
        this.moduleIndex = '1'
        let moduleIndex = 'moduleIndex'
        localStorage.setItem(moduleIndex, '1')
        // this.$router.push({path: '/'})
      }

    },

  }
</script>

<style>
  html,body{
    height: 100%;
  }
  #app{
    position:relative;
    width:100%;
    min-height:100%;
    padding-bottom: 5rem;
    /*padding-bottom: 7rem;*/
    box-sizing: border-box;
    background-position: 0px -30vh;
    background-repeat: no-repeat;
    /*background-color: aliceblue;*/
  }

  .logos{
    /*background-color: gainsboro;*/
    position: absolute;
    right: 12.8rem;;
    margin-top: -4.5rem;
    color: grey;
  }
  .account-icon{
    width: 20px;
    height: 20px;
    margin-right: 5px;
    padding-right: 2px;
  }

  .module{
    font-size: 1.1rem;
  }

  .module-title{
    margin-right: 0.8rem;

  }

  .module-title:hover{
    color: darkcyan;
    cursor: pointer;
  }
  .module-disable{
    margin-right: 0.8rem;
    color: rgba(28,25,34,0.49);
  }

  .drop{
    /*background-color: aquamarine;*/
    /*margin-top: 1rem;*/
    position:relative;
    z-index: 2000;
  }

  .logos span{
    border-radius:12px;
    padding:0.5em;
    cursor: pointer;
  }

  .logos span:hover{
    color: black;
  }

  .btn-secondary{
    /*background-color: white !important;*/
    border: 0px;
  }

  .router-link-exact-active{
    color: gray!important;
    border-bottom: 1px solid azure;
    text-align: center;
  }

  .logo{
    cursor: pointer;
  }

  .loginfo{
    margin-top: 1.2rem;
    display: flex;
    flex-direction: row;
    -webkit-box-align: center;
    align-items: center;
    background-color: rgba(0,0,0,0);
    border-radius: 12px;
    white-space: nowrap;
    width: 100%;
  }


  .right-item{
    text-align: center;
    outline: none;
    text-decoration: none;
    -webkit-box-pack: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    font-size: 16px;
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    -webkit-box-align: center;
    align-items: center;
    padding: 0.4rem 1rem 0.4rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    background-color: rgb(247, 248, 250);
    border: 1px solid rgb(237, 238, 242);
    color: rgb(50, 50, 50);
    font-weight: 400;
    margin-right: 12px;
    height: 32px;
  }
  .right-item:hover{
    background-color: rgb(206, 208, 217);
  }
  .right-item:focus{
    background-color: rgb(206, 208, 217);
    outline: none;
    box-shadow: rgb(246, 221, 232)  0px 0px 0px 1pt;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  #navmanu {
    background-color: white !important;
    padding-left: 5rem;
  }
  .align-top{
    /* margin-left: 3rem; */
  }

  #nav-collapse{
     margin-right: 10rem;
    /*background-color: blueviolet;*/
  }
  #nav-collapse a{
    color: gray;
    /* margin-right: 0.4rem; */
    margin-left: 0.8rem;
  }
  #nav-collapse a:hover{
    /*color: darkcyan;*/
    text-decoration: none;
  }
  #notice {
    padding: 1rem 5rem;
  }
	
	.mask{
	    z-index: 2000;
	    overflow: hidden;
	    display: flex;
	    position: fixed;
	    left: 0;
	    right: 0;
	    top: 0;
	    bottom: 0;
	    -webkit-box-align: center;
	    align-items: center;
	    -webkit-box-pack: center;
	    justify-content: center;
	    background-color: rgba(0, 0, 0, 0.3);
	}
	
	 .mask-box{
	    position: relative;
	    max-width: 280px;
	    width: 100%;
	    background: rgb(255, 255, 255);
	    box-shadow: rgba(0, 0, 0, 0.08) 0px 3px 30px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 3px 16px 24px, rgba(0, 0, 0, 0.01) 3px 24px 32px;
	    border-radius: 10px;
	    padding: 1rem;
	    display: block;
	    z-index: 100;
	    box-sizing: border-box;
	    margin-top: -20vh;
	 }
	
	 .mask-info{
	   display: flex;
	   align-content: center;
	 }
	
	 .mask-info-text{
	   text-align: center;
	   width: 100%;
	 }



  .active{
    color:rgb(158, 10, 10);
    /*border-bottom: 1px solid red;*/
    font-size: 1.2rem;
    padding-bottom: 0.3rem;
    /*border-bottom: 2px solid red;*/
    /*border-radius: 0.6rem;*/
  }
  .noActive{

  }
</style>
