<template>
  <div class="wallet">
     <div>
       <div v-if="!genesisStart" class="titleSelected notStart">
         Lark创世尚未开启！
         <p style="font-size: 0.9rem;color: chocolate">将在区块 20379000 开启创世，预计时间：2021.10.19 17:00！</p>
       </div>
       <!--代理奖励-->
        <div class="delegate">
            <p class="titleSelected">{{ $t('message.delegatemine') }}</p>
            <div class="delegatetext round-box">
                {{ $t('message.yourspdelegate') }}： {{ balanceOfDelegate }} HP<br>
                {{ $t('message.hpTotaldelegate') }}： {{ totalDepositedHP }} HP<br>
                {{ $t('message.hpBalance') }}： {{ balanceOfHp }} HP<br>
                {{ $t('message.larkBalance') }}： {{ larkBalanceOf }} LARK<br>
              <!--  {{ $t('message.apy') }}： {{ apy }} %<br>-->
            </div>
            <hr>
            <div v-if="balanceOfDelegate2 <= 0">
                <div class="round-box">
                  <div class="round-box-title-container">
                    <p class="box-title">
                      {{ $t('message.input') }}
                    </p>
                    <p class="box-title">
                      {{ $t('message.hpBalance') }}：{{ balanceOfHp }}
                    </p>
                  </div>
                  <div class="round-box-content-container">
                        <input
                        class="mb-2 mr-sm-2 mb-sm-0 user input"
                        :class="checkFlag ? 'isok': 'isfalse'"
                        placeholder="0.0" v-model="delegatevalue"
                        @keyup="checkDelegateValue" type="number" inputmode="decimal"
                        pattern="^[0-9]*[.,]?[0-9]*$" spellcheck="false" value>
                         <button id="maxBtn" @click="fillMaxDelegate">Max</button>
                  </div>
                </div>

              <div class="confirm-box" style="margin-bottom:10px">
                <b-button block variant="outline-primary" @click="delegate" :disabled="!checkDelegateFlag">
                  {{ $t('message.confirmdelegate') }}
                </b-button>
              </div>

            </div>

            <!--已代理：-->
            <div v-if="balanceOfDelegate2 > 0">
              <!-- 增加、减少、取消代理 -->
              <div class="confirm-box">
                <b-button variant="outline-primary" @click="delegateOpt=1,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
                  {{ $t('message.adddelegate') }}
                </b-button>
                <b-button variant="outline-primary" @click="delegateOpt=2,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
                  {{ $t('message.minusdelegate') }}
                </b-button>
                <b-button variant="outline-primary" @click="delegateOpt=0,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
                  {{ $t('message.canceldelegate') }}
                </b-button>
              </div>

              <!-- lark代理收益 -->
              <div class="round-box">
                <div class="round-box-content-container">
                  <span>
                    {{ $t('message.larkProfits') }}
                  </span>
                  <span style="color: darkred;">
                    <strong>{{ pendingLark }} </strong>
                  </span>
                </div>
              </div>

              <!-- 提现按钮 -->
              <div class="confirm-box">
                <b-button block variant="outline-success" @click="delegatorHarvest" :disabled="!loadingFlag">
                  {{ $t('message.withdraw') }}
                </b-button>
              </div>
            </div>
        </div>
    </div>

    <!-- 增加或减少代理弹窗 -->
    <transition name="fade">
      <ChangeDelegateMask
          :changeDegate = 'delegateOpt'
          :hpToVests = 'hpToVests'
          :getDelegateInfo = 'getDelegateInfo'
          :subcomponet = 'subcomponet'

          v-if="showDelegateMask"
          @hideMask="showDelegateMask=false"
      >
      </ChangeDelegateMask>
    </transition>

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
              {{ maskInfo }}<br>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import SmallLoading from './SmallLoading'
  import ChangeDelegateMask from './ChangeDelegateMask'
  export default {
    name: "Pool",
    data() {
      return {
				testvalue:'',
        genesisStart: true,
        balanceOfHp: '',
        balanceOfDelegate: '',
        balanceOfDelegate2: '',
        totalDepositedHP:'',
        totalDepositedHP2:'',
        apy:'',

        isLoading: true,
        loadingFlag: false,

        checkFlag: true,
        checkDelegateFlag: false,
        delegatevalue: '',
        hpToVests: '',

        larkBalanceOf: '',
        larkBalanceOf2: '',

        showMask:false,
        successFlag:'',
        maskInfo:"",
        showDelegateMask:false,
        delegateOpt: 1,

        pendingLark:'',
        pendingLark2:'',
        vestsToHp: 0,
      }
    },
    methods: {
      subcomponet(info, flag){
        this.showMask = true
        this.successFlag = flag
        this.maskInfo = info
      },
      async genesisBlock() {
        let instance = this.$store.state.delegateInstance2
        let genesisBlock = 20379000
        let lastRewardBlock = await instance.methods.lastRewardBlock().call()
        let blockNumber = await this.web4.eth.getBlockNumber()
        // console.log(126, "genesisBlock", genesisBlock, lastRewardBlock, blockNumber)
        this.genesisStart = genesisBlock <= blockNumber
        // console.log("genesisStart", this.genesisStart)
      },
      async getHiveStates(){
        let username = this.$store.state.username
        let s = await this.hive.api.getAccountsAsync([username])
        // console.log(566, "getAccountsAsync", s)
        let a = await this.hive.api.getDynamicGlobalPropertiesAsync()
        // console.log(577, "getDynamicGlobalPropertiesAsync", a)
        this.hpToVests = parseFloat(a.total_vesting_shares) / parseFloat(a.total_vesting_fund_hive)
        // console.log(555, "hpToVests", this.hpToVests)
        this.vestsToHp = parseFloat(a.total_vesting_fund_hive) / parseFloat(a.total_vesting_shares)
        let hp = parseFloat(s[0].vesting_shares) * this.vestsToHp
        let delegatedHp = parseFloat(s[0].delegated_vesting_shares) * this.vestsToHp
        this.balanceOfHp = (hp - delegatedHp).toFixed(3)
      },
      checkDelegateValue(){
        let reg = /^\d+(\.\d+)?$/
        let res = reg.test(this.delegatevalue)
        let res1 = false
        if(parseFloat(this.delegatevalue) >= 1){
          res1 = true
        }
        //代理量应小于SP量
        let res2 = parseFloat(this.delegatevalue) <= parseFloat(this.balanceOfHp) - 5
        // console.log(699, "res2", res2)
        this.checkFlag = this.checkDelegateFlag = res && res1 && res2
        },
      async getDelegateInfo(){
        let instance = this.$store.state.delegateInstance2
        let addr = this.$store.state.addr
        let f = await instance.methods.delegators(addr).call()
        let p = f.amount * 1e-6 * this.vestsToHp
        this.balanceOfDelegate =  this.formatData(p)
        this.balanceOfDelegate2 = p

        let larkInstance = this.$store.state.larktokenInstance2
        let n = await larkInstance.methods.balanceOf(addr).call()
        let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
        this.larkBalanceOf = this.formatData(larkBalanceOf)

        let g = await instance.methods.totalDepositedHP().call()
        let g2 = g * 1e-6 * this.vestsToHp
        this.totalDepositedHP = this.formatData(g2)
        this.totalDepositedHP2 = g2
      },

      fillMaxDelegate(){
        this.delegatevalue = this.balanceOfHp - 5
        if (parseFloat(this.delegatevalue) >= 1){
          this.checkDelegateFlag = true
        }
      },
      
			async delegate(){
        this.isLoading = true
        this.checkDelegateFlag = false
        let user = this.$store.state.username
        let addr = this.$store.state.addr
        let b = this.delegatevalue * this.hpToVests
        let amount = b.toFixed(6)

        //hive代理
        let res = await this.hiveDelegate(user, this.delegatee, amount)
        if(res.success === true) {
          //代理成功才挖矿
          await this.sleep()
          this.axios.request({
            method: 'post',
            url: 'https://app.ilark.io:5201/delegate',
            data:{
              user: user,
              addr: addr,
              amount: amount
            }
          })
            .then(arg => {
              this.delegatevalue = ''
              if(arg.data === "ok"){
                this.getDelegateInfo()
                this.isLoading = false
                this.maskInfo = "代理成功！"
                this.successFlag = true
                this.showMask = true
              }else{
                this.maskInfo = "代理失败！\n 请刷新后重试！"
                this.successFlag = false
                this.showMask = true
              }
            })
            .catch(error => {
              this.maskInfo = "代理失败！\n"+error
              this.successFlag = false
              this.showMask = true
            })
        }else{
          this.delegatevalue = ''
          this.isLoading = false
          this.maskInfo = "代理失败！\n"+res.message
          this.successFlag = false
          this.showMask = true
        }
      },
      async delegatorHarvest(){
        try {
          await this.unlockWallet()
          this.isLoading = true
          this.loadingFlag = false
          let instance = this.$store.state.delegateInstance
          let addr = this.$store.state.addr

          let s = await this.web4.eth.getGasPrice()
          let gasPrice = parseFloat(s) + this.addGas
          let option = {
            from: addr,
            gasPrice: gasPrice
          }
          await instance.methods.delegatorHarvest().send(option)

          //查询lark
          let larkInstance = this.$store.state.larktokenInstance2
          let n = await larkInstance.methods.balanceOf(addr).call()
          let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
          this.larkBalanceOf = this.formatData(larkBalanceOf)
          this.isLoading = false
          this.loadingFlag = true
        } catch(e){
          this.isLoading = false
          this.successFlag = false
          this.showMask = true
          this.maskInfo = e
        }
      },
      async getPendingLark(){
        let instance = this.$store.state.delegateInstance2
        let addr = this.$store.state.addr
        let res = await instance.methods.getPendinglark(addr).call()
        let pending = this.web4.utils.fromWei(res, "ether")
        this.pendingLark = this.formatData(pending)

        if(this.genesisStart && this.balanceOfDelegate2 > 0){
          //如果创世启动
          let i = 1
          let repeatPending = async ()=> {
            i ++
            // console.log(633,"i", i)
            let res = await instance.methods.getPendinglark(addr).call()
            let pending = this.web4.utils.fromWei(res, "ether")
            // console.log(333,"pending", pending)
            this.pendingLark = this.formatData(pending)
          }
          let timer = setInterval(repeatPending, 5000)
          // 通过$once来监听定时器，在beforeDestroy钩子时被清除。
          this.$once('hook:beforeDestroy', () => {
            clearInterval(timer)
          })
        }

      },
      hideMask(){
        this.showMask=false
      },
    },

    components: {
      SmallLoading,
      ChangeDelegateMask,
      },

    mounted() {
      if(!this.$store.state.username){
        this.$router.push({path: '/login'})
      }

      let that = this
      let instance = this.$store.state.delegateInstance2
      async function main(){
        if(Object.keys(instance).length === 0){
          //如果刷新页面, instance未定义
          try{
            await that.getDelegateInstance()
            await that.getLarkInstance()

            await that.genesisBlock()
            await that.getHiveStates()
            await that.getDelegateInfo()
            await that.getPendingLark()
            that.loadingFlag = true
          } catch(e){
            that.showMask = true
            that.maskInfo = that.$t('message.tryrefreshpage')+"\n"+e
            this.successFlag = false
            return
          }
        } else{
          try{
            await that.genesisBlock()
            await that.getHiveStates()
            await that.getDelegateInfo()
            await that.getPendingLark()
            that.loadingFlag = true
          } catch(e){
            that.maskInfo = that.$t('message.tryrefreshpage')+"\n"+e
            this.successFlag = false
            that.showMask = true
            return
          }
        }
        that.isLoading = false
        // await that.calPnutApy()
      }
      main()

      //初始化年化收益率
      // if(localStorage.getItem("apy") == null){
      //   this.apy = 52.786
      // }else{
      //   this.apy = localStorage.getItem("apy")
      // }

      //设置定时器以更新当前收益
      // let timer = setInterval(this.getpendingLark, 3000)
      // // 通过$once来监听定时器，在beforeDestroy钩子时被清除。
      // this.$once('hook:beforeDestroy', () => {
      //   clearInterval(timer)
      // })
    },

    }
</script>

<style scoped>

  .wallet{
    width: 45%;
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
    margin-bottom: 2rem;
  }

.changebox{
  display: flex;
  justify-content: space-evenly;
  padding: 1em;
  padding-bottom: 0;

}

.changebox p{
  font-weight: 400;
  color: darkgray;
  font-size: 20px;
  cursor: pointer;
}

.titleSelected{
     color: rgb(30, 30, 30) !important;
     font-weight: 500;
     font-size: 1.2rem;
     cursor: pointer;
     text-align: center;
 }


.changebox p:hover{
  color: rgb(92, 91, 91) !important;
}

  .user{
    margin-top: 1rem;
    width: 30rem;
  }

.round-box{
      border-radius: 20px;
      border: 1px solid rgb(247, 248, 250);
      padding:8px 14px;
      margin-bottom: 1rem;
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
}
.round-box-content-container{
    display: flex;
    flex-flow: row nowrap;
    -webkit-box-align: center;
    align-items: center;
    color: rgb(0, 0, 0);
    font-size: 1rem;
    line-height: 1.2rem;;
    box-sizing: border-box;
    padding-top: 10px;
    padding-bottom: 10px;
    justify-content: space-between;
    -webkit-box-pack: justify;
    height: 100%;
}

.box-title{
    box-sizing: border-box;
    margin: 0px;
    min-width: 0px;
    font-weight: 500;
    font-size: 14px;
    color: rgb(86, 90, 105);
}

.input{
  color: rgb(0, 0, 0);
    width: 100%;
    position: relative;
    font-weight: 500;
    outline: none;
    border: none;
    flex: 1 1 auto;
    background-color: rgb(255, 255, 255);
    font-size: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0px;
    /*appearance: textfield;*/
}
#maxBtn{
  height: 100%;
  margin-top: 16px;
    background-color: rgb(253, 234, 241);
    border: 1px solid rgb(253, 234, 241);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    margin-right: 0.5rem;
    color: rgb(255, 0, 122);
    user-select: none;
}

#maxBtn:focus{
  border: 1px solid rgb(255, 0, 122);
    outline: none;
}

#maxBtn:hover{
      border: 1px solid rgb(255, 0, 122);
}
.pink-arrow-box{
  margin-bottom:1rem;
  display:flex;
  align-items:center;
  align-content: center;
  width:100%;
  text-align: center;
}
.coin-icon{
  margin-top: 15px;
  width:24px;
  height:24px;
}

.pink-arrow{
  cursor: pointer;
}

  .delegatetext{
      line-height: 2rem;
  }


  .confirm-box{
    margin-top: 1em;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-around;
  }


  

  .delegate{
    /* width: 30rem; */
    margin-top: 1rem;
  }
  .notStart{
    color: darkred !important;
  }
  .loginbtn{
    margin-top: 0.5rem;
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
