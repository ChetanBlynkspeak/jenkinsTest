const xlsxFile = require('read-excel-file/node');
const fs = require('fs');
var crypto = require('crypto');

var temp = {}
async function convertMainPage (){
	return new Promise(async (resolve, reject) => {
		try {
			temp["categories"] = {}
			xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Menu Categories' }).then((rows) => {
				rows.forEach((col,i)=>{
					if (i != 0) {
						// console.log(col[0]);
						var random = col[0] != null ? hashString("CAT",col[0]) : reject("Title is missing for categories")

						if (col[1]) {
							if (temp["categories"][random]) {
										var subRandom = "SCAT"+i
										temp["categories"][random]["subcategories"][subRandom] = {}
										temp["categories"][random]["subcategories"][subRandom]["title"] = col[1]
										temp["categories"][random]["subcategories"][subRandom]["sort_order"] = 0
										temp["categories"][random]["subcategories"][subRandom]["items"] = []
										temp["categories"][random]["subcategories"][subRandom]["is_image_category"] = false
										temp["categories"][random]["subcategories"][subRandom]["description"] = ""
							}else {
										temp["categories"][random] = {}
										temp["categories"][random]["title"] = col[0] != null ? col[0] : reject("Title is missing for categories")
										temp["categories"][random]["sort_order"] = col[2] != null ? col[2] : reject("Sort_order missing for "+col[0]+" categories Row : "+i)
										temp["categories"][random]["items"] = []
										temp["categories"][random]["description"] = ''
										temp["categories"][random]["is_image_category"] = col[5] != null ? col[5]:false

										temp["categories"][random]["subcategories"] = {}
										var subRandom = "SCAT"+i
										temp["categories"][random]["subcategories"][subRandom] = {}
										temp["categories"][random]["subcategories"][subRandom]["title"] = col[1]
										temp["categories"][random]["subcategories"][subRandom]["sort_order"] = 0
										temp["categories"][random]["subcategories"][subRandom]["items"] = []
										temp["categories"][random]["subcategories"][subRandom]["is_image_category"] = false
										temp["categories"][random]["subcategories"][subRandom]["description"] = ""
							}
						}else {
							temp["categories"][random] = {}
							temp["categories"][random]["title"] = col[0] != null ? col[0] : reject("Title is missing for categories")
							temp["categories"][random]["sort_order"] = col[2] != null ? col[2] : reject("Sort_order missing for "+col[0]+" categories Row : "+i)
							temp["categories"][random]["items"] = []
							temp["categories"][random]["description"] = ''
							temp["categories"][random]["is_image_category"] = col[5] != null ? col[5]:false
						}
					}
				})
				resolve("aaa")
			})
		} catch (e) {
			console.log("In1");
			reject(e);
		}
	})

}

async function convertMiddlePage (){
	return new Promise(async (resolve, reject) => {
		try {
			await convertMainPage()
			temp["bill_components"] = {}
			temp["bill_components"]["taxes"] = {}
			temp["bill_components"]["charges"] = {}

			temp["items"] = {}

			xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Menu Items' }).then((rows) => {
				// console.log(rows.length);
				rows.forEach((col,i)=>{
					if (i != 0) {
						console.log(col[0]);
						var itemRandom = "I"+i
						var splitData = col[7].split(",")
						splitData.forEach((item, i) => {
							splitData[i] = item.trim()
						});

						if (splitData.length != 1) {
							xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Menu Categories' }).then((rows) => {
								rows.forEach((col1,j)=>{
									if(col1[0] == splitData[0] && col1[1] == splitData[1]){
										// console.log(j);
										var mainRandom = hashString("CAT",splitData[0])
										var subRandom = "SCAT"+j
										if (temp["categories"][mainRandom]["subcategories"][subRandom]) {
											temp["categories"][mainRandom]["subcategories"][subRandom]["items"].push(itemRandom)
										}
									}
								})
							})
						}else {
							xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Menu Categories' }).then((rows) => {
								rows.forEach((col1,j)=>{
									if(col1[0] == splitData[0]){
										// console.log(j);
										var mainRandom = hashString("CAT",splitData[0])
										if (temp["categories"][mainRandom]) {
											temp["categories"][mainRandom]["items"].push(itemRandom)
										}
									}
								})
							})
						}
						temp["items"][itemRandom] = {}
						temp["items"][itemRandom]["title"] = col[0] != null ? col[0] : reject("Title is missing for item")
						temp["items"][itemRandom]["description"] = col[1] != null ? col[1]:""
						temp["items"][itemRandom]["food_type"] = col[5] == 1 || col[5] == 2 || col[5] == 3 ? col[5] : reject("Food type is Wrong for "+col[0]+" item Row : "+i)
						temp["items"][itemRandom]["image_url"] = col[10] != null ? col[10]:""
						temp["items"][itemRandom]["in_stock"] = true
						temp["items"][itemRandom]["price"] = col[2] != null ? col[2] : reject("Price is missing for "+col[0]+" item Row : "+i)
						temp["items"][itemRandom]["recommended"] = true
						temp["items"][itemRandom]["add_on_groups"] = []
						temp["items"][itemRandom]["variant_groups"] = []
						var groupArray = col[9]? col[9].split(","):[]
						groupArray.forEach((item, i) => {
							groupArray[i] = item.trim()
						});
						if (groupArray.length) {
							groupArray.forEach((item) => {
								xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Option <> Option Group' }).then((rows) => {
									rows.forEach((col1,j)=>{
										if (j != 0) {
											if (item == col1[0]) {
												var flag = 0
												if (col1[4] == "Add on") {
													var opRandom = hashString("AOG",col1[0]+col1[1])
													temp["items"][itemRandom]["add_on_groups"].forEach((aaa) => {
														if (aaa == opRandom) {
															flag = 1
														}else {
															flag = 0
														}
													});
													if (flag == 0) {
														temp["items"][itemRandom]["add_on_groups"].push(opRandom)
													}
												}else {
													var opRandom = hashString("VG",col1[0]+col1[1])
													temp["items"][itemRandom]["variant_groups"].forEach((aaa) => {
														if (aaa == opRandom) {
															flag = 1
														}else {
															flag = 0
														}
													});
													if (flag == 0) {
														temp["items"][itemRandom]["variant_groups"].push(opRandom)
													}
												}
											}
										}
									})
								})
							});
						}
						var taxRandom = "TAX"+col[6]*100
						var chargeRandom = "CH"+col[8]

						temp["items"][itemRandom]["bill_components"] = {}
						temp["items"][itemRandom]["bill_components"]["taxes"] = []
						if (col[6] != null) {
							temp["items"][itemRandom]["bill_components"]["taxes"].push(taxRandom)

							if (!temp["bill_components"]["taxes"][taxRandom]) {
								temp["bill_components"]["taxes"][taxRandom] = {}
								temp["bill_components"]["taxes"][taxRandom]["description"] = ""
								temp["bill_components"]["taxes"][taxRandom]["title"] = "GST"
								temp["bill_components"]["taxes"][taxRandom]["value"] = col[6]*100
							}
						}

						temp["items"][itemRandom]["bill_components"]["charges"] = []
						if (col[8] != null) {
							temp["items"][itemRandom]["bill_components"]["charges"].push(chargeRandom)

							if (!temp["bill_components"]["charges"][chargeRandom]) {
								temp["bill_components"]["charges"][chargeRandom] = {}
								temp["bill_components"]["charges"][chargeRandom]["title"] = "Packaging Charge"
								temp["bill_components"]["charges"][chargeRandom]["description"] = ""
								temp["bill_components"]["charges"][chargeRandom]["fulfillment_modes"] = ["takeaway","delivery"]
								temp["bill_components"]["charges"][chargeRandom]["type"] = "fixed"
								temp["bill_components"]["charges"][chargeRandom]["value"] = col[8]
							}
						}

					}
				})
				resolve("aaa")
			})
		} catch (e) {
			console.log("In2");
			reject(e);
		}
	})

}


async function convertlastPage (res){
	return new Promise(async (resolve, reject) => {
		try {
			await convertMiddlePage()
			temp["add_on_groups"] = {}
			temp["variant_groups"] = {}
			temp["addons"] = {}
			temp["variants"] = {}
			xlsxFile(__dirname+'/CSVFILE.xlsx', { sheet: 'Option <> Option Group' }).then((rows) => {
				rows.forEach((col,i)=>{
					if (i != 0) {
						// console.log(col[2]);
						if (col[4] == "Add on") {
							var optionRandom = hashString("AOG",col[0]+col[1])
							var typeRandom = "AO"+i
							if (temp["add_on_groups"][optionRandom]) {
								temp["add_on_groups"][optionRandom]["addons"].push(typeRandom)
								temp["addons"][typeRandom] = {}
								temp["addons"][typeRandom]["title"] = col[2] != null ? col[2] : reject("Title is missing for "+optionRandom+" Row : "+i)
								temp["addons"][typeRandom]["price"] = col[3] != null ? col[3] : reject("Price is missing for"+col[2]+" "+col[4]+" Row : "+i+" Row : "+i)
								temp["addons"][typeRandom]["in_stock"] = true
								temp["addons"][typeRandom]["food_type"] = col[5] == 1 || col[5] == 2 || col[5] == 3 ? col[5] : reject("Food type is Wrong for "+col[2]+" "+col[4]+" Row : "+i+" Row : "+i)
							}else {
								temp["add_on_groups"][optionRandom] = {}
								temp["add_on_groups"][optionRandom]["title"] = col[1] != null ? col[1] : reject("Title is missing for"+optionRandom+" add_on_groups")
								temp["add_on_groups"][optionRandom]["addons"] = []
								temp["add_on_groups"][optionRandom]["minimum_needed"] = 0
								temp["add_on_groups"][optionRandom]["maximum_allowed"] = -1

								temp["add_on_groups"][optionRandom]["addons"].push(typeRandom)
								temp["addons"][typeRandom] = {}
								temp["addons"][typeRandom]["title"] = col[2] != null ? col[2] : reject("Title is missing for "+optionRandom+" Row : "+i)
								temp["addons"][typeRandom]["price"] = col[3] != null ? col[3] : reject("Price is missing for "+col[2]+" "+col[4]+" Row : "+i)
								temp["addons"][typeRandom]["in_stock"] = true
								temp["addons"][typeRandom]["food_type"] = col[5] == 1 || col[5] == 2 || col[5] == 3 ? col[5] : reject("Food type is Wrong for "+col[2]+" "+col[4]+" Row : "+i)
							}

						}else {
							var optionRandom = hashString("VG",col[0]+col[1])
							console.log(col[0]+"---"+col[1]);
							var typeRandom = "V"+i
							if (temp["variant_groups"][optionRandom]) {
								temp["variant_groups"][optionRandom]["variants"].push(typeRandom)
								temp["variants"][typeRandom] = {}
								temp["variants"][typeRandom]["title"] = col[2] != null ? col[2] : reject("Title is missing for "+optionRandom+" Row : "+i)
								temp["variants"][typeRandom]["price"] = col[3]  != null ? col[3] : reject("Price is missing for "+col[2]+" "+col[4]+" Row : "+i)
								temp["variants"][typeRandom]["in_stock"] = true
								temp["variants"][typeRandom]["food_type"] = col[5] == 1 || col[5] == 2 || col[5] == 3 ? col[5] : reject("Food type is Wrong for "+col[2]+" "+col[4]+" Row : "+i)
							}else {
								temp["variant_groups"][optionRandom] = {}
								temp["variant_groups"][optionRandom]["title"] = col[1] != null ? col[1] : reject("Title is missing for "+optionRandom+" variant_groups")
								temp["variant_groups"][optionRandom]["variants"] = []

								temp["variant_groups"][optionRandom]["variants"].push(typeRandom)
								temp["variants"][typeRandom] = {}
								temp["variants"][typeRandom]["title"] = col[2] != null ? col[2] : reject("Title is missing for "+optionRandom+" Row : "+i)
								temp["variants"][typeRandom]["price"] = col[3] != null ? col[3] : reject("Price is missing for "+col[2]+" "+col[4]+" Row : "+i)
								temp["variants"][typeRandom]["in_stock"] = true
								temp["variants"][typeRandom]["food_type"] = col[5] == 1 || col[5] == 2 || col[5] == 3 ? col[5] : reject("Food type is Wrong for "+col[2]+" "+col[4]+" Row : "+i)
							}
						}
					}
				})
				fs.writeFile(__dirname+`/menuJson.json`, JSON.stringify(temp), function (err) {
					if (err) {
						reject (err)
					}
					console.log("Data is successfully converted")
					resolve(temp)
				});
			})
		} catch (e) {
			console.log("In3");
			reject(e);
		}
	})

}

function genRandomNumber(data) {
	var splitData = data.split(" ");
	var random
	if (splitData.length > 1) {
		random = splitData[0]+splitData[1]
	}else {
		random = splitData[0]
	}
  return random
}


function hashString(id,data) {
	var hash = crypto.createHash('md5').update(data).digest('hex');
  return (id+hash.substr(0,6))
}

module.exports = convertlastPage;
//convertMiddlePage()
//convertlastPage()
