<template>
    <div class="wallet">
        <div class="changebox">
            <h5>{{ $t('message.wallet') }}</h5>
        </div>

         <!-- hive -->
         <div class="round-box">
                <div class="round-box-title-container">
                    <p class="box-title">
                        <img class="coin-icon" src="../../static/images/hive.svg" alt="hive">
                    </p>
                    <p class="box-title">
                        {{ $store.state.username }}
                    </p>
                </div>
                <div class="round-box-title-container">
                    <p class="box-title">
                        {{ $t('message.hiveBalance') }}
                    </p>
                    <p class="box-title">
                        {{ balanceOfHive }}
                    </p>
                </div>
             <div class="round-box-title-container">
                 <p class="box-title">
                     {{ $t('message.hbdBalance') }}
                 </p>
                 <p class="box-title">
                     {{ balanceOfHbd }}
                 </p>
             </div>
             <div class="round-box-title-container">
               <p class="box-title">
                 {{ $t('message.delegatedHp') }}
               </p>
               <p class="box-title">
                 {{ balanceOfDelegate }} HP
               </p>
             </div>
              <div class="round-box-title-container">
                  <p class="box-title">
                      {{ $t('message.hpBalance') }}
                  </p>
                  <p class="box-title">
                      {{ balanceOfHp }} HP
                  </p>
              </div>

            </div>

        <!-- polygon -->
        <div class="round-box">
            <div class="round-box-title-container">
                <p class="box-title">
                    <img class="coin-icon" src="../../static/images/polygon.svg" alt="polygon">
                </p>
                <p class="box-title">
                    {{$store.state.addr | formatAddr}}
                </p>
            </div>
            <div class="round-box-title-container">
                <p class="box-title">
                    {{ $t('message.maticBalance') }}
                </p>
                <p class="box-title">
                    {{ balanceOfPolygon }} MATIC
                </p>
            </div>

            <div class="round-box-title-container">
                <p class="box-title">
                    {{ $t('message.larkBalance') }}
                </p>
                <p class="box-title">
                    {{ larkBalanceOf }} LARK
                </p>
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
        name: "Wallet",
        data() {
          return {
            balanceOfDelegate: '',
            balanceOfPolygon: '',
            balanceOfHive: '',
            balanceOfHbd: '',
            balanceOfHp: '',
            hpToVests:'',
            vestsToHp:'',
            larkBalanceOf: '',
            isLoading: true,
            showMask:false,

            }
        },
        methods: {
          async getHiveStates(){
            let username = this.$store.state.username
            let s = await this.hive.api.getAccountsAsync([username])
            // console.log(566, "getAccountsAsync", s)
            this.balanceOfHive = s[0].balance
            this.balanceOfHbd = s[0].hbd_balance
            let a = await this.hive.api.getDynamicGlobalPropertiesAsync()
            // console.log(577, "getDynamicGlobalPropertiesAsync", a)
            this.hpToVests = parseFloat(a.total_vesting_shares) / parseFloat(a.total_vesting_fund_hive)
            // console.log(555, "hpToVests", this.hpToVests)
            this.vestsToHp = parseFloat(a.total_vesting_fund_hive) / parseFloat(a.total_vesting_shares)
            let hp = parseFloat(s[0].vesting_shares) * this.vestsToHp
            let delegatedHp = parseFloat(s[0].delegated_vesting_shares) * this.vestsToHp
            this.balanceOfHp = (hp - delegatedHp).toFixed(3)
          },
          async getDelegateInfo(){
            let instance = this.$store.state.delegateInstance2
            let addr = this.$store.state.addr
            let f = await instance.methods.delegators(addr).call()
            let p = f.amount * 1e-6 * this.vestsToHp
            this.balanceOfDelegate =  this.formatData(p)

            let larkInstance = this.$store.state.larktokenInstance2
            let n = await larkInstance.methods.balanceOf(addr).call()
            let larkBalanceOf = this.web4.utils.fromWei(n, "ether")
            this.larkBalanceOf = this.formatData(larkBalanceOf)

            let y = await this.web4.eth.getBalance(addr)
            let balance = this.web4.utils.fromWei(y, "ether")
            this.balanceOfPolygon = this.formatData(balance)
          },

          hideMask(){
            this.showMask=false
          },
        },
        filters: {
            formatAddr(data) {
                return data.substring(0, 6) + '...' + data.substring(38)
            },
        },

        components: {
            SmallLoading
        },

      mounted() {
        if(!this.$store.state.username){
          this.$router.push({path: '/login'})
        }

        let that = this
        let instance = this.$store.state.delegateInstance2
        async function main(){
          if(Object.keys(instance).length === 0){
            try{
              await that.getDelegateInstance()
              await that.getLarkInstance()

              await that.getHiveStates()
              await that.getDelegateInfo()
            }catch(e){
              that.showMask = true
              that.maskInfo = that.$t('message.tryrefreshpage')+"\n"+e
              return
            }
          } else{

            try{
              await that.getHiveStates()
              await that.getDelegateInfo()
            }catch(e){
              that.maskInfo = that.$t('message.tryrefreshpage')+"\n"+e
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
        width: 30rem;
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
        width: 80%;
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
        margin-bottom: 0.6rem;
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
        width:24px;
        height:24px;
    }

   

</style>
