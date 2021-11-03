<template>
  <div class="wallet">
	 <div >
  <!-- <b-button block variant="outline-primary" @click="emergencyWithdraw">紧急退出</b-button> -->
    <div class="delegate">
      <p class="titleSelected"> Dao Pool</p>
      <div class="delegatetext round-box">
          您的存量： {{ balanceOfDeposit }} DAO<br>
          DAO总存量： {{ balanceOfTotalLp }} DAO<br>
          {{ $t('message.larkBalance') }}： {{ larkBalanceOf }} LARK<br>
        <!--  {{ $t('message.apy') }}： {{ apy }} %<br>-->
      </div>
      <hr>
      <div v-if="balanceOfDeposit2 <= 0">
          <div class="round-box">
            <div class="round-box-title-container">
              <p class="box-title">
                {{ $t('message.input') }}
              </p>
              <p class="box-title">
               DEV余额：{{ balanceOfLp }}
              </p>
            </div>
            <div class="round-box-content-container">
              <input
              class="mb-2 mr-sm-2 mb-sm-0 user input"
              :class="checkFlag ? 'isok': 'isfalse'"
              placeholder="0.0" v-model="depositValue"
              @keyup="checkDepositValue" type="number" inputmode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$" spellcheck="false" value>
              <button id="maxBtn" @click="fillMaxDeposit">Max</button>
            </div>
          </div>

          <div class="confirm-box">
              <b-button v-if="!isApprove" variant="outline-primary"
                        style="margin-right:1rem;width:20rem;"
                        @click="letApprove"
                        :disabled="!approveFlag"
              >
                授权
              </b-button>
              <b-button block variant="outline-primary"  @click="deposit" :disabled="!checkDelegateFlag || !isApprove">
                确认存入
              </b-button>
          </div>

      </div>

      <!--已代理：-->
      <div v-if="balanceOfDeposit2 > 0">
          <!-- 增加、减少、取消代理 -->
        <div class="confirm-box">
          <b-button variant="outline-primary" @click="delegateOpt=1,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
            增加
          </b-button>
          <b-button variant="outline-primary" @click="delegateOpt=2,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
            减少
          </b-button>
          <b-button variant="outline-primary" @click="delegateOpt=0,showDelegateMask=true" style="width:30%;" :disabled="!loadingFlag">
            取消
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
              <b-button block variant="outline-success" @click="harvest" :disabled="!loadingFlag">
                {{ $t('message.withdraw') }}
              </b-button>
            </div>
      </div>
    </div>

    
    <!-- 增加或减少代理弹窗 -->
    <transition name="fade">
      <ChangeDepositMask
          :changeDeposit = 'delegateOpt'
					:poolId = 'poolId'
          :getDepositInfo = 'getDepositInfo'
					:getBalanceAndAllowance = 'getBalanceAndAllowance'
          :subcomponet = 'subcomponet'
          :balanceOfDeposit2 = 'balanceOfDeposit2'
          :balanceOfLp2 = 'balanceOfLp2'

          v-if="showDelegateMask"
          @hideMask="showDelegateMask=false"
      >
      </ChangeDepositMask>
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
                <img src="../../../static/images/success.jpg" class="d-inline-block align-top" alt="success">
              </div>
              <div v-else>
                <img src="../../../static/images/error.jpg" class="d-inline-block align-top" alt="error">
              </div>
              {{ maskInfo }} <br>
            </div>
          </div>
        </div>
      </div>
    </transition>
  
	</div>
	
	</div>
</template>

<script>
  import SmallLoading from '../SmallLoading'
  import ChangeDepositMask from './ChangeDepositMask'
  export default {
    name: "DaoPool",
    data() {
      return {
				poolId: 3,
        depositValue: '',
        balanceOfDeposit:'',
        balanceOfDeposit2:'',
        balanceOfTotalLp:'',
        balanceOfLp:'',
        balanceOfLp2:'',
        allowance:'',

        totalDeposited:'',
        totalDeposited2:'',
        apy:'',

        isLoading: true,
        loadingFlag: false,
        approveFlag: true,

        checkFlag: true,
        checkDelegateFlag: false,

        larkBalanceOf: '',
        larkBalanceOf2: '',

        showMask:false,
        maskInfo:"",
        successFlag:"",
        showDelegateMask:false,
        delegateOpt: 1,

        pendingLark:'',
        pendingLark2:'',
      }
    },
    methods: {
      subcomponet(info, flag){
        this.showMask = true
        this.successFlag = flag
        this.maskInfo = info
      },
      checkDepositValue(){
        let reg = /^\d+(\.\d+)?$/
        let res = reg.test(this.depositValue)
        let res1 = false
        if(parseFloat(this.depositValue) > 0){
          res1 = true
        }
        //代理量应小于SP量
        let res2 = parseFloat(this.depositValue) <= parseFloat(this.balanceOfLp2)
        // console.log(699, "res2", res2)
        this.checkFlag = this.checkDelegateFlag = res && res1 && res2
        },
      async getBalanceAndAllowance(){
				let abi = this.$store.state.ercAbi
				let lpInstance = new this.web4.eth.Contract(abi, this.daoPoolToken)
        let addr = this.$store.state.addr
        let v = await lpInstance.methods.balanceOf(addr).call()
        let lpBalanceOf = this.web4.utils.fromWei(v, "ether")
        this.balanceOfLp = this.formatData(lpBalanceOf)
        this.balanceOfLp2 = lpBalanceOf

        let t = await lpInstance.methods.allowance(addr, this.larkPool).call()
        this.allowance = this.web4.utils.fromWei(t, "ether")
        console.log(366, "allowance", this.allowance)
      },
      async letApprove(){
        this.approveFlag = false
        this.isLoading = true
				let abi = this.$store.state.ercAbi
				let lpInstance = new this.web3.eth.Contract(abi, this.daoPoolToken)

        let p = await this.web4.eth.getGasPrice()
        let addr = this.$store.state.addr
        let gasPrice = parseFloat(p) + this.addGas
        let option = {
          from: addr,
          gasPrice: gasPrice
        }
        let amount = this.web4.utils.toWei('8000000000', 'ether')
        await lpInstance.methods.approve(this.larkPool, amount).send(option)

        await this.sleep()
        await this.getBalanceAndAllowance()
        this.isLoading = false
      },
      async getDepositInfo(){
        let instance = this.$store.state.poolInstance2
        let addr = this.$store.state.addr
        let f = await instance.methods.userInfo(this.poolId, addr).call()
        let p = this.web4.utils.fromWei(f.amounts, "ether")
        this.balanceOfDeposit =  this.formatData(p)
        this.balanceOfDeposit2 = p

        let larkInstance = this.$store.state.larktokenInstance2
        let n = await larkInstance.methods.balanceOf(addr).call()
        let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
        this.larkBalanceOf = this.formatData(larkBalanceOf)

        let abi = this.$store.state.ercAbi
        let lpInstance = new this.web4.eth.Contract(abi, this.daoPoolToken)
        let v = await lpInstance.methods.balanceOf(this.larkPool).call()
        let lpBalanceOf = this.web4.utils.fromWei(v, "ether")
        this.balanceOfTotalLp = this.formatData(lpBalanceOf)
      },

      fillMaxDeposit(){
        this.depositValue = this.balanceOfLp2
        if (parseFloat(this.depositValue) > 0){
          this.checkDelegateFlag = true
        }
      },
      async deposit(){
        try {
          await this.unlockWallet()
          this.isLoading = true
          this.checkDelegateFlag = false
          let instance = this.$store.state.poolInstance
          let addr = this.$store.state.addr
          let amount = this.web4.utils.toWei(this.depositValue, "ether")

          // deposit(uint256 _pid, uint256 _amount)
          let s = await this.web4.eth.getGasPrice()
          let gasPrice = parseFloat(s) + this.addGas
          let option = {
            from: addr,
            gasPrice: gasPrice
          }
          await instance.methods.deposit(this.poolId, amount).send(option)

          await this.getDepositInfo()
					await this.getBalanceAndAllowance()
          await this.getPendingLark()
          this.isLoading = false
          this.successFlag = true
          this.maskInfo = "存入成功！"
          this.showMask = true
        } catch (e) {
          this.isLoading = false
          this.successFlag = false
          this.maskInfo = e
          this.showMask = true
        }

      },
      async harvest(){
        try {
          await this.unlockWallet()
          this.isLoading = true
          this.loadingFlag = false
          let instance = this.$store.state.poolInstance
          let addr = this.$store.state.addr
          let s = await this.web4.eth.getGasPrice()
          let gasPrice = parseFloat(s) + this.addGas
          let option = {
            from: addr,
            gasPrice: gasPrice
          }
          await instance.methods.harvest(this.poolId).send(option)

          //查询lark
          let larkInstance = this.$store.state.larktokenInstance2
          let n = await larkInstance.methods.balanceOf(addr).call()
          let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
          this.larkBalanceOf = this.formatData(larkBalanceOf)
          this.isLoading = false
          this.loadingFlag = true
        }  catch(e){
          this.isLoading = false
          this.showMask = true
          this.successFlag = false
          this.maskInfo = e
        }
      },
      async getPendingLark(){
        let instance = this.$store.state.poolInstance2
        let addr = this.$store.state.addr
        let res = await instance.methods.pendingLark(this.poolId, addr).call()
        let pending = this.web4.utils.fromWei(res, "ether")
        this.pendingLark = this.formatData(pending)

        if(this.balanceOfDeposit2 > 0) {
          let i = 1
          let repeatPending = async () => {
            i++
            // console.log(633, "i", i)
            let res = await instance.methods.pendingLark(this.poolId, addr).call()
            let pending = this.web4.utils.fromWei(res, "ether")
            // console.log(333, "pending", pending)
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

      async emergencyWithdraw(){
        //emergencyWithdraw(uint256 _pid)
        try {
          this.isLoading = true
          this.loadingFlag = false
          let instance = this.$store.state.poolInstance
          let addr = this.$store.state.addr
          let s = await this.web4.eth.getGasPrice()
          let gasPrice = parseFloat(s) + this.addGas
          let option = {
            from: addr,
            gasPrice: gasPrice
          }
          await instance.methods.emergencyWithdraw(this.poolId).send(option)

          //查询lark
          let larkInstance = this.$store.state.larktokenInstance2
          let n = await larkInstance.methods.balanceOf(addr).call()
          let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
          this.larkBalanceOf = this.formatData(larkBalanceOf)
          this.isLoading = false
          this.loadingFlag = true
        }
        catch(e){
          this.isLoading = false
          this.successFlag = false
          this.showMask = true
          this.maskInfo = e
        }
      },

    },

    components: {
      SmallLoading,
      ChangeDepositMask,
      },
    computed: {
      isApprove() {
        if(this.depositValue === ''){
          // console.log("isApprove", this.depositValue)
          return parseFloat(this.allowance) >= 0
        } else {
          // console.log("isApprove", parseFloat(this.allowance) >= parseFloat(this.depositValue))
          return parseFloat(this.allowance) >= parseFloat(this.depositValue)
        }
      }
    },

    mounted() {
      if(!this.$store.state.username){
        this.$router.push({path: '/login'})
      }

      let that = this
			let instance = this.$store.state.poolInstance2

      async function main(){
        if(Object.keys(instance).length === 0){
          try{
            await that.getPoolInstance()
            await that.getLarkInstance()

            await that.getDepositInfo()
            await that.getBalanceAndAllowance()
            await that.getPendingLark()
            that.loadingFlag = true
          }catch(e){
            that.showMask = true
            that.successFlag = false
            that.maskInfo = e
            return
          }
        } else{
          try{
            await that.getDepositInfo()
            await that.getBalanceAndAllowance()
            await that.getPendingLark()
            that.loadingFlag = true
          }catch(e){
            that.successFlag = false
            that.maskInfo = e
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
    width: 25%;
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
