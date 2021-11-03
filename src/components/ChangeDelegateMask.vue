<template>
  <div class="mask" @click.stop="hideMask">

      <!--增加代理-->
      <div class="changeBox" @click.stop="stop" v-if="changeDegate === 1">
          <div class="title" style="width:100%;text-align:center;font-weight:500;font-size:20px">
              {{ $t('message.adddelegate') }}
          </div>
          <div class="round-box">
            <div class="operate-balance" style="text-align:right;margin-bottom:12px;color:gray;font-size:14px;color:rgb(86, 90, 105)">
                {{ $t('message.hpBalance') }}：{{ balanceOfHp }}
								<img v-if="loadingFlag" class="coin-icon" src="../../static/images/loading_2.gif" alt="ilark-loading">
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
            <b-button block variant="outline-primary" :disabled="!canAddFlag"  @click="addDelegate">
              {{ $t('message.confirmadddelegate') }}
            </b-button>
          </div>

          <div style="margin-top:8px;margin-left:4px">
              <!--加载动画-->
              <transition name="fade">
                  <SmallLoading v-if="isLoading"></SmallLoading>
              </transition>
          </div>

      </div>

      <!--减少代理-->
      <div class="changeBox" @click.stop="stop" v-else-if="changeDegate === 2">
          <div class="title" style="width:100%;text-align:center;font-weight:500;font-size:20px">
              {{ $t('message.minusdelegate') }}
          </div>
          <div class="round-box">
              <div class="operate-balance" style="text-align:right;margin-bottom:12px;color:gray;font-size:14px;color:rgb(86, 90, 105)">
                  {{ $t('message.delegatedhp') }}：{{ delegatedHp }}
									<img v-if="loadingFlag" class="coin-icon" src="../../static/images/loading_2.gif" alt="ilark-loading">
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
          <b-button block variant="outline-primary" :disabled="!canSubFlag"  @click="subDelegate">
            {{ $t('message.confirmminusdelegate') }}
          </b-button>
        </div>

          <div style="margin-top:8px;margin-left:4px">
              <!--加载动画-->
              <transition name="fade">
                  <SmallLoading v-if="isLoading"></SmallLoading>
              </transition>
          </div>

      </div>

      <!--取消代理-->
      <div class="changeBox" @click.stop="stop" v-else>
          <div class="confirm-box">
            <b-button block variant="outline-primary" :disabled="!canDelFlag"  @click="delDelegate">
              {{ $t('message.confirmcanceldelegate') }}
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
    import SmallLoading from './SmallLoading'
    export default {
        name: "ChangeDelegateMask",
        props: ['changeDegate',
                'hpToVests',
                'getDelegateInfo',
                'subcomponet',
        ],
        data(){
            return {
                delegatedHp: '',
                balanceOfHp: '',
                addvalue: '',
                checkAddFlag: true,
                canAddFlag: false,
                subvalue:'',
                checkSubFlag: true,
                canSubFlag: false,
                canDelFlag: true,

                isLoading: false,
								loadingFlag: true,

                opValue:null,
                opValueIsOK:false,

            }
        },
        methods:{
            async getDelegateHp(){
              let user = this.$store.state.username
              let s = await this.hive.api.getAccountsAsync([user])
              let hp = parseFloat(s[0].vesting_shares) / this.hpToVests

              let res = await this.hive.api.getVestingDelegationsAsync(user, this.delegatee, 1)
              let t = parseFloat(res[0].vesting_shares) / this.hpToVests
              this.delegatedHp = t.toFixed(3)

              let totalDelegatedHp = parseFloat(s[0].delegated_vesting_shares) / this.hpToVests
              this.balanceOfHp = (hp - totalDelegatedHp).toFixed(3)
							this.loadingFlag = false

              console.log(688, "delegatedHp", this.delegatedHp, parseFloat(res[0].vesting_shares))
            },
            checkAddValue(){
                let reg = /^\d+(\.\d+)?$/
                let res = reg.test(this.addvalue)
                let res1 = false
                if(parseFloat(this.addvalue) >= 1){
                    res1 = true
                }
                //增加量应小于SP量
                let res2 = parseFloat(this.addvalue) <= parseFloat(this.balanceOfHp) - 5
                this.canAddFlag = this.checkAddFlag = res && res1 && res2
            },
            checkSubValue(){
                let reg = /^\d+(\.\d+)?$/
                let res = reg.test(this.subvalue)
                let res1 = false
                if(parseFloat(this.subvalue) >= 1){
                    res1 = true
                }
                //减少应小于代理SP量
                let res2 = parseFloat(this.subvalue) <= parseFloat(this.delegatedHp)
                this.canSubFlag = this.checkSubFlag = res && res1 && res2
            },

            fillMaxDelegate(){
                this.addvalue = parseFloat(this.balanceOfHp) - 5
                if (parseFloat(this.addvalue) >= 1){
                  this.canAddFlag = true
                }
            },
            fillMaxSub(){
                this.subvalue = parseFloat(this.delegatedHp)
                if (parseFloat(this.subvalue) >= 1){
                    this.canSubFlag = true
                }
            },
            async addDelegate(){
              try {
                this.isLoading = true
                this.canAddFlag = false
                let user = this.$store.state.username
                let addr = this.$store.state.addr
                let f = parseFloat(this.addvalue) + parseFloat(this.delegatedHp)
                let b = f * this.hpToVests
                let amount = b.toFixed(6)

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
                    this.addvalue = ''
                    if(arg.data === "ok"){
                      this.hideMask()
                      this.getDelegateInfo()
                      this.subcomponet("代理成功！", true)
                    }else{
                      this.hideMask()
                      this.subcomponet("代理失败！\n 请刷新后重试！", false)
                    }
                  })
                  .catch(error => {
                    this.hideMask()
                    this.subcomponet("错误！\n" + error, false)
                  })
                }else{
                  this.hideMask()
                  this.subcomponet("代理失败！\n"+res.message, false)
                }
              }  catch(e){
                this.hideMask()
                this.subcomponet("错误\n" + e, false)
              }
            },
            async subDelegate(){
              try {
                  this.isLoading = true
                  this.canSubFlag = false
                  let user = this.$store.state.username
                  let addr = this.$store.state.addr
                  let f = parseFloat(this.delegatedHp) - parseFloat(this.subvalue)
                  let b = f * this.hpToVests
                  let amount = b.toFixed(6)

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
                      this.subvalue = ''
                      if(arg.data === "ok"){
                        this.isLoading = false
                        this.hideMask()
                        this.getDelegateInfo()
                        this.subcomponet("代理成功！", true)
                      }else{
                        this.hideMask()
                        this.subcomponet("代理失败！\n" , false)
                      }
                    })
                    .catch(e => {
                      this.hideMask()
                      this.subcomponet("错误\n" + e, false)
                    })
                }else{
                  this.hideMask()
                  this.subcomponet("错误\n" + res.message, false)
                }
              }  catch(e){
                this.hideMask()
                this.subcomponet("错误\n" + e, false)
              }
            },
            async delDelegate(){
              try {
                this.isLoading = true
                this.canDelFlag = false
                let user = this.$store.state.username
                let addr = this.$store.state.addr
                let amount = '0.000000'

                let res = await this.hiveDelegate(user, this.delegatee, amount)
                if(res.success === true) {
                //代理成功才挖矿
                await this.sleep()
                this.axios.request({
                  method: 'post',
                  url: 'https://app.ilark.io:5201/delegate',
                  // url: 'http://localhost:5200/delegate',
                  data:{
                    user: user,
                    addr: addr,
                    amount: amount
                   }
                })
                .then(arg => {
                  if(arg.data === "ok"){
                    this.isLoading = false
                    // alert("取消代理成功！")
                    this.hideMask()
                    this.getDelegateInfo()
                    this.subcomponet("取消代理成功！", true)
                  }else{
                    this.hideMask()
                    this.subcomponet("取消代理失败！\n", false)
                  }
                })
                .catch(error => {
                  this.hideMask()
                  this.subcomponet("取消代理失败！\n"+ error, false)
                })
              }else{
                this.hideMask()
                this.subcomponet("取消代理失败！\n"+res.message, false)
              }
              }
              catch(e){
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
            await that.getDelegateHp()
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
      width: 40%;
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
