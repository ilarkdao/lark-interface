import larkArt from '../../../public/LarkArtNft.json'

const getArtInstance = async function(){
  let instance = new this.web3.eth.Contract(larkArt.abi, this.larkArtNFT)
  //将得到的数据存入vuex中
  this.$store.commit('saveArtInstance', instance)
  let instance2 = new this.web4.eth.Contract(larkArt.abi, this.larkArtNFT)
  //将得到的数据存入vuex中
  this.$store.commit('saveArtInstance2', instance2)
	
	//photoNft
	let instancePhoto = new this.web3.eth.Contract(larkArt.abi, this.larkPhotoNFT)
	//将得到的数据存入vuex中
	this.$store.commit('savePhotoInstance', instancePhoto)
	let instancePhoto2 = new this.web4.eth.Contract(larkArt.abi, this.larkPhotoNFT)
	//将得到的数据存入vuex中
	this.$store.commit('savePhotoInstance2', instancePhoto2)
}

export {getArtInstance}
