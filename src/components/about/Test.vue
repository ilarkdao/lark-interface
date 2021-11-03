<template>
  <div id="content">
    <h1>{{ $t("message.contact") }}</h1>

    <div class="text">
   <p><strong>Gmail</strong> <br>
     larkneer@gmail.com
    </p>

    <p><strong>Medium</strong> <br>

    </p>

    <p><strong>twitter</strong> <br>
        @larkneer
    </p>

    </div>


  </div>
</template>

<script>

  export default {
    name: "Test",
    data() {
      return {

      }
    },
		methods: {
			async getHistory(){
				let account = "lark.test"
				let res = await this.hive.api.getAccountHistoryAsync(account, -1, 100)
				console.log(123, res)
				return res
			},
			async getDelegatorsInfo(){
				let instance = this.$store.state.delegateInstance2
				let res = await instance.methods.getDelegatorsInfo().call()
				console.log(566, res)
				//amount: "75400156967"
				// hasDeposited: true
				// hiveAccount: "blc"
				// rewardDebt: "1355
				return res
			},
		
			async checkEveryDelegator(list){
				let instance = this.$store.state.delegateInstance2
				let delegatorsInfo = await this.getDelegatorsInfo()
				let delegatorLists = []
				for(let i = list.length - 1; i >= 0; i --){
					if(list[i][1].op[0] === "delegate_vesting_shares"){
						console.log(i, list[i][1].op[1])
						if(!delegatorLists.includes(list[i][1].op[1].delegator)){
							delegatorLists.push(list[i][1].op[1].delegator)
							for(let j = 0; j < delegatorsInfo.length; j ++){
								if(delegatorsInfo[j].hiveAccount === list[i][1].op[1].delegator){
									//代理值比对
									if(parseFloat(delegatorsInfo[j].amount) < parseFloat(list[i][1].op[1].vesting_shares)){
										console.log(12, "delegateUpdate()")
									}
									else if(parseFloat(delegatorsInfo[j].amount) === parseFloat(list[i][1].op[1].vesting_shares)){
										console.log(12)
									}
									else{
										console.log(12, "delegateUpdate(0)")
									}
								}
							}		
						}
					}
				}
			},
			
			test(){}
			
		},
		mounted() {
			
			let that = this
			
			async function main(){
				await that.getDelegateInstance()
				
				await that.getHistory()
				
				// that.checkEveryDelegator(res)
			}
			main()
			
		}


  }
</script>

<style scoped>
  h1{
    font-size: 2rem;
    text-align: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ddd;
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

