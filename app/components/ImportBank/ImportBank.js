import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import styles from "./ImportBank.css";
// import { dateToShort } from "../../utils/readableDate";
import * as PendingImportActions from "../../actions/pendingImport";

class ImportBank extends Component<Props> {
    props: Props;

    constructor(props){
        super(props);

        this.state = {
            editPane: false,
            savedCategory: props.categoryName === "" ? "default" : props.categoryName,
            savedItem: props.itemName === "" ? "default" : props.itemName,
            savedNote: props.note,
            savedCategoryId: props.categoryId,
            savedItemId: props.itemId,
            editCategory: false,
            editItem: false,
            pendingCategory: props.categoryName,
            pendingItem: props.itemName,
            pendingNote: props.note,
            newCategory: "",
            newItem: "",
            newNote: props.note
        };
        
        this.undoPendingChanges = this.undoPendingChanges.bind(this);
        this.saveAllPendingChanges = this.saveAllPendingChanges.bind(this);
        this.createCategoryDropDown = this.createCategoryDropDown.bind(this);
        this.createItemDropDown = this.createItemDropDown.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
        this.onItemChange = this.onItemChange.bind(this);        
        this.changeNewCategory = this.changeNewCategory.bind(this);
        this.changeNewItem = this.changeNewItem.bind(this);
        this.changeNewNote = this.changeNewNote.bind(this);
        this.submitNewCategoryName = this.submitNewCategoryName.bind(this);
        this.submitNewItemName = this.submitNewItemName.bind(this);
        this.submitNewNote = this.submitNewNote.bind(this);
        this.trimNote = this.trimNote.bind(this);
        this.toggleEditPane = this.toggleEditPane.bind(this);        
    }

    undoPendingChanges(){        
        this.props.setOverwriteCategoryName(this.props.tempId, "");
        this.props.setOverwriteItemName(this.props.tempId, "");
        this.props.setOverwriteNote(this.props.tempId, "");
        this.setState({
            savedCategoryId: "",
            savedItemId: "",
            savedCategory: this.props.defaultCategory,
            savedItem: this.props.defaultItem,
            savedNote: this.props.defaultNote,
            pendingCategory: this.props.categoryName,
            pendingItem: this.props.itemName,
            pendingNote: this.props.note,
            newCategory: "",
            newItem: "",
            newNote: this.props.note,
            editCategory: false,
            editItem: false
        });
    }

    saveAllPendingChanges(){
        if (this.state.pendingCategory !== this.state.savedCategory && this.state.newCategory !== ""){
            this.props.setOverwriteCategoryName(this.props.tempId, this.state.newCategory);
            this.props.setCategoryId(this.props.tempId, this.state.savedCategoryId);
            this.submitNewCategoryName();            
        }
        
        if (this.state.pendingItem !== this.state.savedItem && this.state.newItem !== ""){
            this.props.setOverwriteItemName(this.props.tempId, this.state.newItem);
            this.props.setItemId(this.props.tempId, this.state.savedItemId);
            this.submitNewItemName();
        }
        
        if (this.state.pendingNote !== this.state.savedNote){
            this.props.setOverwriteNote(this.props.tempId, this.state.newNote);
            this.props.setNote(this.props.tempId, this.state.savedNote);
            this.submitNewNote();
        }        
    }
    
    createCategoryDropDown(){
        const options = [];
        let index = 0;

        if (this.props.defaultCategory !== ""){
            options.push((<option key={index} value={this.props.defaultCategory}>{this.props.defaultCategory} (bank)</option>));
        } else {
            options.push((<option key={index} selected={this.state.savedCategory === "" && this.state.savedCategoryId === ""} value="default" label="default" />));
        }
        index += 1;

        if (this.state.savedCategoryId === ""){
            // Add categories from the given dateId
            for (let i = 0; i < this.props.categories.length; i++){
                if (this.props.categories[i].dateId === this.props.dateId){
                    options.push((<option key={index} data-categoryid={this.props.categories[i].id} value={this.props.categories[i].name}>{this.props.categories[i].name} (found)</option>));
                    index += 1;
                }            
            }

            if (this.state.savedCategory !== "" && this.state.savedCategory !== this.props.defaultCategory){
                options.push((<option key={index} selected={this.state.savedCategory !== ""} value={this.state.savedCategory}>{this.state.savedCategory} (edit)</option>))
            } else {
                options.push((<option key={index} value="">create new</option>));
            }
        } else {

            // Add categories from the given dateId
            for (let i = 0; i < this.props.categories.length; i++){
                if (this.props.categories[i].dateId === this.props.dateId){
                    options.push((<option key={index} data-categoryid={this.props.categories[i].id} value={this.props.categories[i].name} defaultValue={this.props.categories[i].id === this.state.savedCategoryId}>{this.props.categories[i].name} {this.props.categories[i].id === this.props.categoryId ? "(selected)" : "(found)"}</option>));
                    index += 1;
                }            
            }

            if (this.state.savedCategory !== "" && this.state.savedCategory !== this.props.defaultCategory){
                options.push((<option key={index} selected={this.state.savedCategory !== ""} value={this.state.savedCategory}>{this.state.savedCategory} (edit)</option>))
            } else {
                options.push((<option key={index} value="">create new</option>));
            }
        }
        

        return options;
    }

    createItemDropDown(){
        const options = [];
        let index = 0;

        if (this.props.defaultItem !== ""){
            options.push((<option key={index} value={this.props.defaultItem}>{this.props.defaultItem} (bank)</option>));
        } else {
            options.push((<option key={index} selected={this.state.savedItem === ""} value="default" label="default" />));
        }        
        index += 1;

        if (this.state.savedCategoryId === ""){
            
            if (this.state.savedItem !== "" && this.state.savedItem !== this.props.defaultItem){
                options.push((<option key={index} selected={this.state.savedItem !== ""} value={this.state.savedItem}>{this.state.savedItem} (edit)</option>))
            } else {
                options.push((<option key={index} value="">create new</option>));
            }
        } else {

            // Add items from the given categoryId
            for (let i = 0; i < this.props.items.length; i++){
                if (this.props.items[i].dateId === this.props.dateId && this.props.items[i].categoryId === this.state.savedCategoryId){
                    options.push((<option key={index} data-itemid={this.props.items[i].id} value={this.props.items[i].name} selected={this.props.items[i].id === this.state.savedItemId}>{this.props.items[i].name} {this.props.items[i].id === this.props.itemId ? "(selected)" : "(found)"}</option>));
                    index += 1;
                }            
            }

            if (this.state.savedItem !== "" && this.state.savedItem !== this.props.defaultItem && this.state.savedItemId === ""){
                options.push((<option key={index} selected={this.state.savedItem !== ""} value={this.state.savedItem}>{this.state.savedItem} (edit)</option>))
            } else {
                options.push((<option key={index} value="">create new</option>));
            }
        }
        

        return options;
    }

    toggleEditPane(event){
        // Don't toggle it if we clicked the import checkbox
        if (event.target.localName === "input") return;

        this.setState(state => ({
            editPane: !state.editPane,
            pendingCategory: state.savedCategory,
            pendingItem: state.savedItem,
            pendingNote: state.savedNote,
            editCategory: false,
            editItem: false
        }));
    }

    changeNewCategory(event){
        this.setState({
            newCategory: event.target.value,
            pendingCategory: event.target.value
        });
    }

    changeNewItem(event){
        this.setState({
            newItem: event.target.value,
            pendingItem: event.target.value
        });
    }

    changeNewNote(event){
        this.setState({
            newNote: event.target.value,
            pendingNote: event.target.value
        });
    }

    onCategoryChange(event){
        const {value} = event.target;
        let matched = "";

        // Check if <option> was found from existing categories
        for (let i = 0; i < event.target.children.length; i++){
            if (event.target.children[i].value === value){
                matched = event.target.children[i].getAttribute("data-categoryid");
                if (matched === null) matched = "";
                break;
            }
        }        

        this.setState({
            savedCategoryId: matched,
            editCategory: value === "" || (value !== this.props.defaultCategory && matched === ""),
            pendingCategory: value,
            newCategory: value
        });
    }

    onItemChange(event){
        const {value} = event.target;
        let matched = "";

        // Check if <option> was found from existing items
        for (let i = 0; i < event.target.children.length; i++){
            if (event.target.children[i].value === value){
                matched = event.target.children[i].getAttribute("data-itemid");
                if (matched === null) matched = "";
                break;
            }
        }   

        this.setState({
            savedItemId: matched,
            editItem: value === "" || (value !== this.props.defaultItem && matched === ""),
            pendingItem: value,
            newItem: value
        });
    }

    submitNewCategoryName(){
        const {newCategory} = this.state;
        this.setState({
            savedCategory: newCategory,
            editCategory: false,
            newCategory: ""
        });
    }

    submitNewItemName(){
        const {newItem} = this.state;
        this.setState({
            savedItem: newItem,
            editItem: false,
            newItem: ""
        });
    }

    submitNewNote(){
        const {newNote} = this.state;
        this.setState({
            savedNote: newNote,
            newNote
        });        
    }
    
    renderCreateNewCategory(){
        if (this.state.editCategory){
            const { t } = this.props;

            return (
                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-3">
                            <label className="form-label" htmlFor="new-category-input">{t("NewCategoryName")}</label>
                        </div>
                        <div className="col-6">
                            <input className="form-input" id="new-category-input" type="text" value={this.state.newCategory} onChange={this.changeNewCategory} placeholder={t("NewCategoryNameLowercase")} />
                        </div>
                    </div>
                </div>  
            );
        }        
    }

    renderCreateNewItem(){
        if (this.state.editItem){
            const { t } = this.props;
            
            return (
                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-3">
                            <label className="form-label" htmlFor="new-subcategory-input">{t("NewSubHypenCategoryName")}</label>
                        </div>
                        <div className="col-6">
                            <input className="form-input" id="new-subcategory-input" type="text" value={this.state.newItem} onChange={this.changeNewItem} placeholder={t("NewSubHypenCategoryNameLowercase")} />
                        </div>
                    </div>
                </div>  
            );
        }        
    }

    renderEditPane(){
        if (this.state.editPane){
            const { t } = this.props;

            return (
                <div className="columns">
                    <div className={`column col-12 ${styles["edit-window"]}`}>
                        <form className="form-horizontal" onSubmit={() => this.saveAllPendingChanges()}>
                            <div className="form-group">                                
                                <div className="col-3">
                                    <label className="form-label" htmlFor="category-select-edit">{t("Category")}</label>
                                </div>
                                <div className="col-6">
                                    <select className="form-select" id="category-select-edit" onChange={this.onCategoryChange}>
                                        {this.createCategoryDropDown()}
                                    </select>
                                </div>
                            </div>
                            {this.renderCreateNewCategory()}
                            <div className="form-group">                                
                                <div className="col-3">
                                    <label className="form-label" htmlFor="subcategory-select-edit">{t("SubHypenCategory")}</label>
                                </div>
                                <div className="col-6">
                                    <select className="form-select" id="subcategory-select-edit" onChange={this.onItemChange}>
                                        {this.createItemDropDown()}
                                    </select>
                                </div>
                            </div>
                            {this.renderCreateNewItem()}
                            <div className="form-group">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="note-edit-label">{t("Note")}</label>
                                </div>
                                <div className="col-6">
                                    <input className="form-input" id="note-edit-label" type="text" value={this.state.newNote} onChange={this.changeNewNote} placeholder={t("noteLowercase")} />
                                </div>
                            </div>
                            <div className="column col-12">
                                <div className="form-group float-left">
                                    <input className="btn btn-error" type="button" value={t("UndoAll")} disabled={!(this.state.savedCategory !== this.props.defaultCategory || this.state.savedItem !== this.props.defaultitem || this.state.savedNote !== this.props.defaultNote)} onClick={() => this.undoPendingChanges()} />
                                </div>
                                <div className="form-group float-right">
                                    <input className="btn btn-primary" type="submit" disabled={!((this.props.overwriteCategoryName === "" ? (this.state.pendingCategory !== this.state.savedCategory && this.state.newCategory !== "") : (this.state.newCategory !== "" ? this.props.overwriteCategoryName !== this.state.newCategory : this.state.pendingCategory !== this.props.overwriteCategoryName)) 
                                    ||
                                    (this.props.overwriteItemName === "" ? (this.state.pendingItem !== this.state.savedItem && this.state.newItem !== "") : (this.state.newItem !== "" ? this.props.overwriteItemName !== this.state.newItem : this.state.pendingItem !== this.props.overwriteItemName))
                                    ||
                                    (this.state.newNote !== this.state.savedNote))} value={t("Update")} />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
    }

    trimNote(note){
        if (note.length > 25){
            return `${note.substring(0, 24)  }...`;
        } 
            return note;
        
    }

    overwriteCategory(){
        if (this.props.overwriteCategoryName !== "" && this.props.overwriteCategoryName !== this.props.defaultCategory && this.props.overwriteCategoryName !== "default"){
            return (
                <span style={{fontWeight: "bold"}}>
                    {this.props.overwriteCategoryName}
                </span>
            );
        } 
            return (
                <span>
                    {this.props.categoryName}
                </span>
            );
        
    }

    overwriteItem(){
        if (this.props.overwriteItemName !== "" && this.props.overwriteItemName !== this.props.defaultItem && this.props.overwriteItemName !== "default"){
            return (
                <span style={{fontWeight: "bold"}}>
                    {this.props.overwriteItemName}
                </span>
            );
        } 
            return (
                <span>
                    {this.props.itemName}
                </span>
            );
        
    }

    overwriteNote(){
        if (this.props.overwriteNote !== "" && this.props.overwriteNote !== this.props.defaultNote){
            return (
                <span style={{fontWeight: "bold"}}>
                    {this.trimNote(this.props.overwriteNote)}
                </span>
            );
        } 
            return (
                <span>
                    {this.trimNote(this.props.note)}
                </span>
            );
        
    }

    render () {
        return (
            <React.Fragment>
                <div role="switch" tabIndex={0} aria-checked={this.state.editPane ? "true" : "false"} className={`columns ${styles.importrow}`} onClick={this.toggleEditPane} onKeyUp={this.toggleEditPane}>
                    <div className="column col-1">
                        <input type="checkbox" value="import" checked={this.props.toImport} onClick={() => this.props.modifyImportCheckbox(this.props.tempId, !this.props.toImport)} />
                    </div>                    
                    <div className="column col-1">
                        {`${this.props.dateId}`}
                    </div>
                    <div className="column col-1">
                        ${this.props.amount}
                    </div>
                    <div className="column col-2">
                        {this.overwriteCategory()}
                    </div>
                    <div className="column col-2">
                        {this.overwriteItem()}
                    </div>
                    <div className={`column col-5 ${styles.note}`}>
                        {this.overwriteNote()}
                    </div>
                </div>
                {this.renderEditPane()}
            </React.Fragment>            
        );
    }
}

function mapStateToProps(state){    
    return {
        categories: state.categories,
        items: state.items,
        pendingImport: state.pendingImport
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({        
        ...PendingImportActions
    }, dispatch);
}

const translatedComponent = withTranslation()(ImportBank);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translatedComponent);