import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import hive from '@hiveio/hive-js'
import Web3 from 'web3'
import axios from 'axios'
import VueI18n from 'vue-i18n'
import {create} from 'ipfs-http-client'


Vue.use(BootstrapVue)
Vue.use(VueI18n)

//设置语言包
const DEFAULT_LANG = navigator.language
const LOCALE_KEY = 'localeLanguage'

const i18n = new VueI18n({
  // locale:'en',
  locale:'zh-CN',
  messages: {
    'zh-CN': require('./assets/lang/zh_CN'),
    'en': require('./assets/lang/EN')
  },
  fallbackLocale: 'zh-CN'
})

const setup = lang => {
  if (lang === undefined){
    lang = window.localStorage.getItem(LOCALE_KEY)
    if (i18n.messages[lang] === undefined){
      lang = DEFAULT_LANG
    }
  }
  window.localStorage.setItem(LOCALE_KEY, lang)
  Object.keys(i18n.messages).forEach(lang => {
    document.body.classList.remove(`lang-${lang}`)
  })
  document.body.classList.add(`lang-${lang}`)
  document.body.setAttribute('lang', lang)

  Vue.config.lang = lang
  i18n.locale = lang
}

setup()


//设置hive节点, 挂载到全局
hive.api.setOptions({ url: 'https://anyx.io' })
Vue.prototype.hive = hive


//设置ipfs节点, ,挂载到全局
const ipfs = create({ host: 'ipfs.ilark.io', port: '9001', protocol: 'https' })
Vue.prototype.ipfs = ipfs

//Polygon网络
let web3
let web4
if (typeof window.ethereum !== 'undefined'){
  console.log(111, "metamask")
  web3 = new Web3(window.ethereum)

  // let url = "https://polygon-mumbai.infura.io/v3/c7200e255f2d4f68bad9d2ca077720b1"
  let url = "https://polygon-rpc.com"
  let web3Provider2 = new Web3.providers.HttpProvider(url)
  web4 = new Web3(web3Provider2)

} else {
  console.log(222, "无metamask")
  alert("没有安装metamask！\n 请安装！ https://metamask.io ")
}

//contract
let larkToken = "0x4cE8485608F78921Fbc0F96e63c0566B1b176Db0"
let delegatedPoolToken = "0xC0e19F94603637c2B56a5371EFf067Cb727bE656"
let larkPool = "0xD48cA0B1a9C143c8570e34F5C0dE5a9E29ffB3d3"
let delegatedPool = "0xc75576849fc9A53cE0a510748662CE201F0E3F67"
let devPoolToken = "0x546228f9661459CEAd9Dd3c18549F04a943B74F0"

let daoPoolToken = "0x331eb669314E3C7aa8ff289E0260d83a3d2b2439"
let vcPoolToken = "0x385DcAF2543bA9f74CCF2b8fD42C37E138C08e7d"

let lpToken = "0xf6d625e6168f8b3cd96cbf3b8a32bece38d0775a"  //DAI-LARK
let larkArtNFT = "0xA338108f5Cac545f1E9E4De1E97D745434104bc7"
let larkPhotoNFT = "0x8148127575a4f1B8587BbDc0cefaa64c1af25D4e"
let mintFee = 50

let addGas = 5e9  //5 GWei

let delegatee = "ilark"


// import {timeFormat} from "./utils/timeFormat"
// import {formatSeconds} from "./utils/formatSeconds"
import {sleep} from "./utils/sleep"  
import {getstr} from "./utils/getstr"
import {devTeam} from "./utils/devTeam"
import {unlockWallet} from "./utils/unlockWallet"
import {hiveDelegate} from "./utils/hiveDelegate"
import {formatData} from "./utils/formatData"
import {postToHive} from "./utils/postToHive" 
// import {approve} from "./utils/approve"
import {getDelegateInstance} from "./utils/pool/getDelegateInstance"
import {getPoolInstance} from "./utils/pool/getPoolInstance"
import {getLarkInstance} from "./utils/token/getLarkInstance"
import {getArtInstance} from "./utils/art/getArtInstance" 


// Vue.prototype.timeFormat = timeFormat
// Vue.prototype.formatSeconds = formatSeconds
Vue.prototype.web3 = web3
Vue.prototype.web4 = web4
Vue.prototype.sleep  = sleep 
Vue.prototype.getstr  = getstr
Vue.prototype.unlockWallet  = unlockWallet
Vue.prototype.hiveDelegate  = hiveDelegate
Vue.prototype.formatData = formatData 
Vue.prototype.postToHive = postToHive 
// Vue.prototype.approve = approve
Vue.prototype.getDelegateInstance = getDelegateInstance
Vue.prototype.getPoolInstance = getPoolInstance
Vue.prototype.getLarkInstance = getLarkInstance
Vue.prototype.getArtInstance = getArtInstance

Vue.prototype.lpToken = lpToken
Vue.prototype.larkToken = larkToken  
Vue.prototype.delegatedPoolToken = delegatedPoolToken
Vue.prototype.devPoolToken = devPoolToken   
Vue.prototype.daoPoolToken = daoPoolToken
Vue.prototype.vcPoolToken= vcPoolToken
Vue.prototype.larkPool = larkPool
Vue.prototype.delegatedPool = delegatedPool
Vue.prototype.larkArtNFT = larkArtNFT
Vue.prototype.larkPhotoNFT = larkPhotoNFT
Vue.prototype.addGas = addGas
Vue.prototype.delegatee = delegatee
Vue.prototype.axios = axios 
Vue.prototype.devTeam = devTeam
Vue.prototype.mintFee = mintFee 


Vue.config.productionTip = false

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')

router.beforeEach(function (to, from, next) {
  if(to.meta.requireAuth){
    // 要去的url只有登陆成功后才能访问
    if (store.state.username) {
      next()
    } else {
      next({name: 'login'})
    }
  }else{
    next()
  }
})

