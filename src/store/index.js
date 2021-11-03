import Vue from 'vue'
import Vuex from 'vuex'
import Cookie from 'vue-cookies'

Vue.use(Vuex)

export default new Vuex.Store({

  // 组件中通过 this.$store.state.username 调用
  state: {
    username: Cookie.get("username"),
    addr: Cookie.get("addr"),

    poolInstance: {},
    poolInstance2: {},

    delegateInstance: {},
    delegateInstance2: {},

    larktokenInstance: {},
    larktokenInstance2: {},
		ercAbi: [],


    artInstance: {},
    artInstance2: {},
		
		photoInstance: {},
		photoInstance2: {},

    created: [],
		photoCreated: []



  },
  mutations: {
    // 组件中通过 this.$store.commit('saveToken',参数)  调用,只能带一个参数，有多个参数以对象的形式传入
    saveUser: function (state, userobj) {
      state.username = userobj.username
      state.addr = userobj.addr

      Cookie.set("username", userobj.username, "30d")
      Cookie.set("addr", userobj.addr, "30d")
    },


    savePoolInstance: function (state, instance){
      state.poolInstance = instance
    },
    savePoolInstance2: function (state, instance2){
      state.poolInstance2 = instance2
    },

    saveDelegateInstance: function (state, instance){
      state.delegateInstance = instance
    },
    saveDelegateInstance2: function (state, instance2){
      state.delegateInstance2 = instance2
    },

    savelarktokenInstance: function (state, instance){
      state.larktokenInstance = instance
    },
    savelarktokenInstance2: function (state, instance2){
      state.larktokenInstance2 = instance2
    },
		saveERCAbi: function (state, abi){
		  state.ercAbi = abi
		},

    saveArtInstance: function (state, instance){
      state.artInstance = instance
    },
    saveArtInstance2: function (state, instance2){
      state.artInstance2 = instance2
    },
		
		savePhotoInstance: function (state, instance){
		  state.photoInstance = instance
		},
		savePhotoInstance2: function (state, instance2){
		  state.photoInstance2 = instance2
		},

    saveCreated: function (state, instance){
      state.created = instance
    },
		savePhotoCreated: function (state, instance){
		  state.photoCreated = instance
		},
		


    clearUser: function (state) {
      state.username = null
      state.password = null
      state.active = null
      state.addr = null
      Cookie.remove('username')
      Cookie.remove('password')
      Cookie.remove('active')
      Cookie.remove('addr')
    }
  }
})

