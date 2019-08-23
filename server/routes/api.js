let express = require('express');
let router = express.Router();
const Warehouse = require('../models/Warehouse');
const Storage = require('../models/Storage');
const Good = require('../models/Good');
const StoragePurchase = require('../models/StoragePurchase');
const Invoice = require("nodeice");
const fs = require('fs');

router.post('/addWarehouse', async function (req, res) {
    let warehouse = new Warehouse(req.body);
    try {
        await warehouse.save();
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error})
    }
    return res.status(200).json({message: "Success"});
});

router.post('/addStorage', async function (req, res) {
    let storage = new Storage(req.body);
    try {
        await storage.save();
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error})
    }
    return res.status(200).json({message: "Success"});
});

router.post('/addGood', async function (req, res) {
    let good = new Good(req.body);
    try {
        await good.save();
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error})
    }
    return res.status(200).json({message: "Success"});
});

router.get('/getAllWarehouses', function (req, res) {
    Warehouse.find({}, function (err, warehouseList) {
        if (err) {
            return res.status(500).json({error: err})
        }
        return res.status(200).json({message: "Success", result: warehouseList});
    });
});

router.get('/getStoragesForWarehouseById', function (req, res) {
    if (req.query.id == null || req.query.id === "undefined") {
        return res.status(400).json({message: "Id not found"});
    }
    Storage.find({warehouseId: req.query.id, empty: true}, function (err, storageList) {
        if (err) {
            return res.status(500).json({error: err})
        }
        return res.status(200).json({message: "Success", result: storageList});
    });
});

router.get('/getAllGoods', function (req, res) {
    Good.find({}, function (err, goodsList) {
        if (err) {
            return res.status(500).json({error: err})
        }
        return res.status(200).json({message: "Success", result: goodsList});
    });
});

router.post('/buyStorage', async function (req, res) {
    if (req.body == null || req.body.details == null || !(req.body.details instanceof Array)) {
        return res.status(400).json({message: "Storage details not found or badly formatted"});
    }
    let storageDetails = req.body.details;
    try {
        let tasks = [];
        await Promise.all(storageDetails.map(async (storageDetail) => {
            let storageId = storageDetail.key;
            let goodId = storageDetail.goodSelected;
            let numberOfDays = storageDetail.numberOfDays;
            let currentDate = new Date();
            let storagePurchase = new StoragePurchase({
                storageId: storageId,
                goodId: goodId,
                startDate: currentDate,
                endDate: currentDate.setDate(currentDate.getDate() + numberOfDays)
            });
            let goodObject = await Good.findById(goodId);
            let storageObject = await Storage.findById(storageId);
            let warehouseObject = await Warehouse.findById(storageObject.warehouseId);
            tasks.push({
                description: warehouseObject.name + " (" + storageDetail.label + ") - " + goodObject.name,
                unit: "Days",
                quantity: numberOfDays,
                unitPrice: goodObject.costPerDay
            });
            try {
                let storageData = await Storage.findById(storageId);
                storageData.empty = false;
                storageData.filledUntil = storagePurchase.endDate;
                await Storage.findByIdAndUpdate(storageId, {
                    $set: {
                        empty: false,
                        filledUntil: storagePurchase.endDate
                    }
                });
                await storagePurchase.save();
            } catch (error) {
                return res.status(500).json({error: error});
            }
        }));
        let myInvoice = new Invoice({
            config: {
                template: __dirname + "/template/index.html"
                , tableRowBlock: __dirname + "/template/blocks/row.html"
            },
            data: {
                currencyBalance: {
                    main: 1,
                    secondary: 0.15
                },
                invoice: {
                    number: {
                        series: "PREFIX"
                        , separator: "-"
                        , id: 1
                    }
                    , date: new Date().toJSON().slice(0,10).replace(/-/g,'/')
                    , dueDate: "N/A"
                    , explanation: "Thank you for your business!"
                    , currency: {
                        main: "RMB"
                        , secondary: "USD"
                    }
                }
                , tasks: tasks
            }
            , seller: {
                company: "Goware"
                , registrationNumber: "F05/XX/YYYY"
                , taxId: "00000000"
                , address: {
                    street: "The Street Name"
                    , number: "00"
                    , zip: "000000"
                    , city: "Some City"
                    , region: "Some Region"
                    , country: "China"
                }
                , phone: "+86 726 xxx xxx"
                , email: "me@example.com"
                , website: "example.com"
                , bank: {
                    name: "Some Bank Name"
                    , swift: "XXXXXX"
                    , currency: "XXX"
                    , iban: "..."
                }
            }
            , buyer: {
                company: "Another Company xyz"
                , taxId: "00000000"
                , address: {
                    street: "The Street Name"
                    , number: "00"
                    , zip: "000000"
                    , city: "Some City"
                    , region: "Some Region"
                    , country: "China"
                }
                , phone: "+86 726 xxx xxx"
                , email: "me@example.com"
                , website: "example.com"
                , bank: {
                    name: "Some Bank Name"
                    , swift: "XXXXXX"
                    , currency: "XXX"
                    , iban: "..."
                }
            }
        });


        myInvoice.toHtml(__dirname + "/my-invoice.html", (err, data) => {
            console.log("Saved HTML file");
        }).toPdf(__dirname + "/my-invoice.pdf", (err, data) => {
            console.log("Saved pdf file");
            return res.status(200).json({message: "Success"});
        });
    } catch (error) {
        return res.status(500).json({error: error});
    }
});

router.get('/getInvoice', function (req, res) {
    let data = fs.readFileSync(__dirname + "/my-invoice.pdf");
    res.contentType("application/pdf");
    res.send(data);
});

module.exports = router;
