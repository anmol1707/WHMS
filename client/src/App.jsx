import React from 'react';
import Select from 'react-select';
import './App.css';
import styled from "@emotion/styled";
import axios from 'axios';
const FileDownload = require('js-file-download');

export const Button = styled('button')`
    min-height: 30px;
    width: 200px;
    border-radius: 30px;
    color: #FFFFFF;
    font-size: 19px;
    font-weight: 700;
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #00c5b4;
    cursor: pointer; 
    transition: 200ms;
    border-color: transparent;
    
    &:hover {
        transform: scale(1.1)
    }
`;

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            availableStoragePlaces: [],
            selectedWarehouse: "",
            warehousesAvailable: [],
            selectedStorages: [{}],
            availableGoods: []
        };
        this.api = "http://127.0.0.1:3001/";
        this.renderStorageRow = this.renderStorageRow.bind(this);
        this.handleWareHouseSelect = this.handleWareHouseSelect.bind(this);
        this.getAvailableStorages = this.getAvailableStorages.bind(this);
        this.handleStorageSelect = this.handleStorageSelect.bind(this);
        this.handleGoodSelect = this.handleGoodSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        axios.get(`${this.api}api/getAllWarehouses`).then((res) => {
            let warehousesAvailable = [];
            // eslint-disable-next-line array-callback-return
            res.data.result.map((warehouse) => {
                warehousesAvailable.push({
                    label: warehouse.name,
                    key: warehouse["_id"],
                });
            });
            this.setState({
                warehousesAvailable: warehousesAvailable
            });
        }).catch((err) => {
            alert(err);
        });
        axios.get(`${this.api}api/getAllGoods`).then((res) => {
            let availableGoods = [];
            // eslint-disable-next-line array-callback-return
            res.data.result.map((availableGood) => {
                availableGoods.push({
                    label: availableGood.name,
                    key: availableGood["_id"],
                });
            });
            this.setState({
                availableGoods: availableGoods
            });
        }).catch((err) => {
            alert(err);
        })
    }

    renderStorageRow(storage, index) {
        return (
            <div className={"storageInputRow"}>
                <div style={{width: "35%"}}>
                    <Select
                        placeholder = {"Available Storages"}
                        isMulti={false}
                        name="filters"
                        options={this.state.availableStoragePlaces}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.key}
                        onChange={(options, action) => this.handleStorageSelect(options, action, index)}
                    />
                </div>
                <div style={{width: "35%"}}>
                    <Select
                        placeholder = {"Available Good Types"}
                        isMulti={false}
                        name="filters"
                        options={this.state.availableGoods}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.key}
                        isOptionSelected={option => option.value}
                        onChange={(options, action) => this.handleGoodSelect(options, action, index)}

                    />
                </div>
                <div>
                    <input type={"number"} placeholder={"Number Of Days"} onChange={(e) => {
                        let {selectedStorages} = this.state;
                        selectedStorages[index]['numberOfDays'] = parseInt(e.target.value);
                        this.setState({
                            selectedStorages: selectedStorages
                        });
                    }}/>
                </div>
            </div>

        );
    }

    getAvailableStorages() {
        axios.get(`${this.api}api/getStoragesForWarehouseById?id=${this.state.selectedWarehouse}`).then((res) => {
            let availableStoragePlaces = [];
            // eslint-disable-next-line array-callback-return
            res.data.result.map((storage, index) => {
                availableStoragePlaces.push({
                    key: storage["_id"],
                    label: `Storage ${index + 1}`
                });
            });
            this.setState({
                availableStoragePlaces: availableStoragePlaces,
                selectedStorages: [],
            },()=>{
                this.setState({
                    selectedStorages: [{}]
                });
            })
        }).catch((err) => {
            alert(err);
        })
    }

    handleStorageSelect(options, action, index) {
        switch (action.action) {
            case "select-option":
                let {selectedStorages} = this.state;
                let isStorageAlreadySelected = false;
                for (let i = 0; i < selectedStorages.length; i++) {
                    if (selectedStorages[i]["key"] === options.key) {
                        alert("Storage Already Selected");
                        isStorageAlreadySelected = true;
                    }
                }
                if (!isStorageAlreadySelected) {
                    selectedStorages[index]["key"] = options.key;
                    selectedStorages[index]["label"] = options.label;
                } else {
                    selectedStorages.pop();
                }

                this.setState({
                    selectedStorages: selectedStorages,
                });
                this.forceUpdate();
                break;
        }
    }

    handleGoodSelect(options, action, index) {
        switch (action.action) {
            case "select-option":
                let {selectedStorages} = this.state;
                selectedStorages[index]["goodSelected"] = options.key;
                this.setState({
                    selectedStorages: selectedStorages,
                });
                console.log(selectedStorages);
                this.forceUpdate();
                break;
        }
    }

    handleSubmit(e){
        for(let i=0; i<this.state.selectedStorages.length; i++){
            let selectedStorage = this.state.selectedStorages[i];
            if(selectedStorage.key == null || selectedStorage.goodSelected == null || selectedStorage.numberOfDays == null || selectedStorage.numberOfDays <= 0){
                alert("Please enter valid storage information");
                return;
            }
        }
        axios.post(`${this.api}api/buyStorage`, {details: this.state.selectedStorages}).then((res) => {
            this.setState({
                availableStoragePlaces: [],
                selectedWarehouse: "",
                selectedStorages: [{}],
            });
            axios.get(`${this.api}api/getInvoice`, {responseType: 'blob'}).then((response) => {
                console.log(response.data);
                FileDownload(response.data, 'invoice.pdf');
            }).catch((err)=>{
                alert(err)
            });
            alert("Thank You For Buying")
        }).catch((err)=>{
            alert(err);
        });
    }

    handleWareHouseSelect(options, action) {
        switch (action.action) {
            case "select-option":
                this.setState({
                    selectedWarehouse: options.key
                }, () => {
                    this.getAvailableStorages();
                });
                this.forceUpdate();
                break;
        }
    }

    render() {
        return (
            <div className="App">
                <div style={{width: "20%", marginBottom: 50}}>
                    <Select
                        placeholder = {"Select Warehouse"}
                        isMulti={false}
                        name="filters"
                        options={this.state.warehousesAvailable}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.key}
                        onChange={this.handleWareHouseSelect}
                    />
                </div>
                {this.state.availableStoragePlaces.length > 0 &&
                this.state.selectedStorages.map((storage, index) => {
                    return this.renderStorageRow(storage, index);
                })}
                {this.state.availableStoragePlaces.length > 0 &&
                <Button onClick={(e) => {
                    let {selectedStorages} = this.state;
                    selectedStorages.push({});
                    this.setState({
                        selectedStorages: selectedStorages
                    });
                }}>Add Storage</Button>}
                {this.state.availableStoragePlaces.length > 0 &&
                <Button onClick={this.handleSubmit}>Submit</Button>}
            </div>
        );
    }
}


