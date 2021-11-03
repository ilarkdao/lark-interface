<template>
<div id="content">
    <h1>{{ $t('message.delegatorList') }}</h1>
    <div class="text">
      <b-table striped hover :items="items" :fields="fields"></b-table>
			<img v-if="loadingFlag" class="coin-icon" style="display:block;margin:0 auto;" src="../../../static/images/loading_2.gif" alt="ilark-loading">
    </div>
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

  export default {
    name: "DelegatorLists",
    data() {
      return {
        fields: ['id', 'hiveId', 'polygon', 'delegatedHP'],
        // items: [
        //   { isActive: true, id: 1, steemId: 'Dickerson', tron: 'Macdonald', delegatedSP: 20 },
        // ],
        showMask:false,
				loadingFlag: true,
        maskInfo:"",
        vestsToHp: '',
        lists: []

      }
    },
    computed:{
      items() {
        return this.lists
      },
    },
    methods: {
      async getHiveStates(){
        let a = await this.hive.api.getDynamicGlobalPropertiesAsync()
        this.vestsToHp = parseFloat(a.total_vesting_fund_hive) / parseFloat(a.total_vesting_shares)
      },
      async getDelegateList(){
        let delegatePool = this.$store.state.delegateInstance2
				let delegators = await delegatePool.methods.getDelegators().call()
				let infos = await delegatePool.methods.getDelegatorsInfo().call()

        for(let i = 0; i < delegators.length; i++){
          let p = delegators[i]
          let res = infos[i]
          let amount = (res.amount * 1e-6 * this.vestsToHp).toFixed(3)
          let t = { isActive: true, id: i, hiveId: res.hiveAccount, polygon: p, delegatedHP: amount }
          this.lists.push(t)
        }
				this.loadingFlag = false
      },
      hideMask(){
        this.showMask=false
      },
    },
    mounted() {
      let that = this
      async function main(){
        try{
          await that.getDelegateInstance()
          await that.getLarkInstance()
          await that.getHiveStates()
          await that.getDelegateList()
        }catch(e){
          that.maskInfo = that.$t('message.tryrefreshpage')+"\n"+e
          that.showMask = true
        }

      }
      main()
    },


  }
</script>

<style scoped>
  h1{
    font-size: 2rem;
    text-align: center;
    padding-bottom: 1rem;
    /*border-bottom: 1px solid #ddd;*/
  }
  #content{
    color: rgba(55,53,58,0.75);
    align: center;
    margin: 1rem auto;
    width: 60%;
    padding-bottom: 0.2rem;
  }
  .text{
    line-height: 1.8rem;
  }

  a{
    color: rgba(55,53,58,0.75);
  }

  a:hover{
    color: darkcyan;
    text-decoration: none;
  }

  .btn-outline-primary {
    color: rgba(55,53,58,0.75);
    border-color: rgba(55,53,58,0.75);
  }
  .btn-outline-primary:hover{
    background-color: chocolate;
  }
</style>

