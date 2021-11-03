<template>
  <div class="mask" @click.stop="hideMask">
      <!--增加存量-->
      <div class="changeBox" @click.stop="stop" v-if="changeDeposit === 1">
          <div class="title" style="width:100%;text-align:center;font-weight:500;font-size:20px">
              增加存量
          </div>
          <div class="round-box">
            <div class="operate-balance" style="text-align:right;margin-bottom:12px;color:gray;font-size:14px;color:rgb(86, 90, 105)">
                余额：{{ balanceOfLp2 }}
            </div>
            <div class="input-container">
                <div class="round-box-content-container">
                    <input
                      class="mb-2 mr-sm-2 mb-sm-0 user input"
                      :class="checkAddFlag ? 'isok': 'isfalse'"
                      placeholder="0.0" v-model="addvalue"
                      @keyup="checkAddValue" type="number" inputmode="decimal"
                      pattern="^[0-9]*[.,]?[0-9]*$" spellcheck="false" value>
                      <button class="maxBtn" @click="fillMaxDelegate">Max</button>
                </div>
            </div>
          </div>
          <div class="confirm-box">
            <b-button block variant="outline-primary" :disabled="!canAddFlag"  @click="deposit">
              增加存量
            </b-button>
          </div>

          <div style="margin-top:8px;margin-left:4px">
              <!--加载动画-->
              <transition name="fade">
                  <SmallLoading v-if="isLoading"></SmallLoading>
              </transition>
          </div>

      </div>

      <!--减少存量-->
      <div class="changeBox" @click.stop="stop" v-else-if="changeDeposit === 2">
          <div class="title" style="width:100%;text-align:center;font-weight:500;font-size:20px">
            减少存量
          </div>
          <div class="round-box">
              <div class="operate-balance" style="text-align:right;margin-bottom:12px;color:gray;font-size:14px;color:rgb(86, 90, 105)">
                  已存入数额：{{ balanceOfDeposit2 }}
              </div>
              <div class="input-container">
                  <div class="round-box-content-container">
                      <input
                        class="mb-2 mr-sm-2 mb-sm-0 user input"
                        :class="checkSubFlag ? 'isok': 'isfalse'"
                        placeholder="0.0" v-model="subvalue"
                        @keyup="checkSubValue" type="number" inputmode="decimal"
                        pattern="^[0-9]*[.,]?[0-9]*$" spellcheck="false" value>
                       <button class="maxBtn" @click="fillMaxSub">Max</button>
                  </div>
              </div>
          </div>

        <div class="confirm-box">
          <b-button block variant="outline-primary" :disabled="!canSubFlag"  @click="withdraw">
            减少存量
          </b-button>
        </div>

          <div style="margin-top:8px;margin-left:4px">
              <!--加载动画-->
              <transition name="fade">
                  <SmallLoading v-if="isLoading"></SmallLoading>
              </transition>
          </div>

      </div>

      <!--取消存量-->
      <div class="changeBox" @click.stop="stop" v-else>
          <div class="confirm-box">
            <b-button block variant="outline-primary" :disabled="!canDelFlag"  @click="delDeposit">
              取消存量
            </b-button>
          </div>
          <div style="margin-top:8px;margin-left:4px">
              <!--加载动画-->
              <transition name="fade">
                  <SmallLoading v-if="isLoading"></SmallLoading>
              </transition>
          </div>
      </div>

  </div>
</template>

<script>
    import SmallLoading from '../SmallLoading'
    export default {
        name: "ChangeDepositMask",
        props: ['poolId',
								'changeDeposit',
                'hpToVests',
                'getDepositInfo',
								'getBalanceAndAllowance',
                'subcomponet',
                'balanceOfDeposit2',
                'balanceOfLp2',
        ],
        data(){
            return {
                addvalue: '',
                checkAddFlag: true,
                canAddFlag: false,
                subvalue:'',
                checkSubFlag: true,
                canSubFlag: false,
                canDelFlag: true,

                isLoading: false,

                opValue:null,
                opValueIsOK:false,

            }
        },
        methods:{
          checkAddValue(){
            let reg = /^\d+(\.\d+)?$/
            let res = reg.test(this.addvalue)
            let res1 = false
            if(parseFloat(this.addvalue) > 0){
                res1 = true
            }
            //增加量应小于等于LP量
            let res2 = parseFloat(this.addvalue) <= parseFloat(this.balanceOfLp2)
            this.canAddFlag = this.checkAddFlag = res && res1 && res2
          },
          checkSubValue(){
            let reg = /^\d+(\.\d+)?$/
            let res = reg.test(this.subvalue)
            let res1 = false
            if(parseFloat(this.subvalue) > 0){
                res1 = true
            }
            //减少应小于等于LP存量
            let res2 = parseFloat(this.subvalue) <= parseFloat(this.balanceOfDeposit2)
            this.canSubFlag = this.checkSubFlag = res && res1 && res2
          },

          fillMaxDelegate(){
            this.addvalue = this.balanceOfLp2
            if (parseFloat(this.addvalue) > 0){
              this.canAddFlag = true
            }
          },
          fillMaxSub(){
            this.subvalue = this.balanceOfDeposit2
            if (parseFloat(this.subvalue) > 0){
                this.canSubFlag = true
            }
          },
          async deposit(){
            try {
              await this.unlockWallet()
              this.isLoading = true
              this.canAddFlag = false
              let instance = this.$store.state.poolInstance
              let addr = this.$store.state.addr
							console.log(566, this.addvalue)
              let amount = this.web4.utils.toWei(this.addvalue, "ether")
							console.log(578, amount)

              // deposit(uint256 _pid, uint256 _amount)
              let s = await this.web4.eth.getGasPrice()
              let gasPrice = parseFloat(s) + this.addGas
              let option = {
                from: addr,
                gasPrice: gasPrice
              }
              await instance.methods.deposit(this.poolId, amount).send(option)

              this.isLoading = false
              // alert("代理成功！")
              this.hideMask()
              this.getDepositInfo()
							this.getBalanceAndAllowance()
              this.subcomponet("增加存量成功！", true)
            } catch (e) {
              this.hideMask()
              this.subcomponet(e, false)
            }

          },
          async withdraw(){
            try {
              await this.unlockWallet()
              this.isLoading = true
              this.canSubFlag = false
              let instance = this.$store.state.poolInstance
              let addr = this.$store.state.addr
              let amount = this.web4.utils.toWei(this.subvalue, "ether")

              // deposit(uint256 _pid, uint256 _amount)
              let s = await this.web4.eth.getGasPrice()
              let gasPrice = parseFloat(s) + this.addGas
              let option = {
                from: addr,
                gasPrice: gasPrice
              }
              //withdraw(uint256 _pid, uint256 _amount)
              await instance.methods.withdraw(this.poolId, amount).send(option)
              this.isLoading = false
              this.hideMask()
              this.getDepositInfo()
							this.getBalanceAndAllowance()
              this.subcomponet("减少存量成功！", true)
            } catch (e) {
              this.hideMask()
              this.subcomponet(e, false)
            }

          },
          async delDeposit(){
            try {
              await this.unlockWallet()
              this.isLoading = true
              this.canDelFlag = false
              let instance = this.$store.state.poolInstance
              let addr = this.$store.state.addr
              let userInfo = await instance.methods.userInfo(this.poolId, addr).call()

              let s = await this.web4.eth.getGasPrice()
              let gasPrice = parseFloat(s) + this.addGas
              let option = {
                from: addr,
                gasPrice: gasPrice
              }
              //withdraw(uint256 _pid, uint256 _amount)
              await instance.methods.withdraw(this.poolId, userInfo.amounts).send(option)

              this.isLoading = false
              this.hideMask()
              this.getDepositInfo()
							this.getBalanceAndAllowance()
              this.subcomponet("减少存量成功！", true)
            } catch (e) {
              this.hideMask()
              this.subcomponet(e, false)
            }
          },


          hideMask(){
            this.$emit('hideMask')
            // this.subcomponet(this.$t('message.error')+"\n")
          },
          stop(){
              // donothing
          },
        },
        components: {
            SmallLoading
        },
        mounted() {
          let that = this
          async function main(){

          }
          main()

        }
    }
</script>

<style scoped>
  .mask {
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    display: flex;
    align-content: center;
    align-items: center;
  }
  .mask .changeBox{
      width: 20%;
      min-width: 400px;
      max-width: 520px;
      /* height: 30%; */
      background-color: white;
      /*margin-top: 10vh;*/
      margin-top: 2rem;
      border-radius: 20px;
      border: 1px solid rgb(247, 248, 250);
      padding:8px 14px;
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

  .round-box-content-container{
      display: flex;
      flex-flow: row nowrap;
      -webkit-box-align: center;
      align-items: center;
      color: rgb(0, 0, 0);
      font-size: 1rem;
      line-height: 1.2rem;;
      box-sizing: border-box;
      padding-top: 14px;
      justify-content: space-between;
      -webkit-box-pack: justify;
      height: 100%;
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
      appearance: textfield;
  }
  .maxBtn{
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

  .maxBtn:focus{
      border: 1px solid rgb(255, 0, 122);
      outline: none;
  }

  .maxBtn:hover{
      border: 1px solid rgb(255, 0, 122);
  }

  .confirm-box{
      margin-top: 1em;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-around;
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
      margin-top: -50vh;
  }

  .mask-info{
      display: flex;
      align-content: center;
  }

  .mask-info-text{
      text-align: center;
      width: 100%;
  }

  .delegate{
      /* width: 30rem; */
      margin-top: 1rem;
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
