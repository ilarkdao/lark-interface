import larktoken from '../../../public/LarkToken.json'

const getLarkInstance = async function(){
  let instance = new this.web3.eth.Contract(larktoken.abi, this.larkToken)
  // console.log(289, 'hammer',instance)
	
	//存取abi
	this.$store.commit('saveERCAbi', larktoken.abi)

  //将得到的数据存入vuex中
  this.$store.commit('savelarktokenInstance', instance)

  let instance2 = new this.web4.eth.Contract(larktoken.abi, this.larkToken)

  let s = await instance2.methods.totalSupply().call()
  // console.log(9666,"larktoken total", this.web4.utils.fromWei(s, 'ether'))
  // let t = await instance2.methods.balanceOf(this.delegatedlarktoken).call()
  // console.log(288, 'larktoken balance',(t))
  // console.log(289, 'larktoken balance',this.web4.utils.fromWei(t, 'ether'))



  //将得到的数据存入vuex中
  this.$store.commit('savelarktokenInstance2', instance2)
}

export {getLarkInstance}
