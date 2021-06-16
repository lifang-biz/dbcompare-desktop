<template>
  <div class="list-container">
    <div v-for="(table, index) in tableList" :class="{'table':true,'not-exists':table.Meta.IS_PLACEHOLDER === true}">
      <div class="line">
        <span :class="{ 'title':true,'color-red': titleRed(table.Meta) }">{{index+1}}. {{table.Meta.TABLE_NAME}}</span>
        <span class="tips">
          <span :class="{'tip-item':true,'color-red': titleTipsRed(table.Meta.TABLE_NAME,'ENGINE')}" title="Engine">{{table.Meta.ENGINE}}</span>
          <span :class="{'tip-item':true,'color-red': titleTipsRed(table.Meta.TABLE_NAME,'TABLE_COLLATION')}" title="Table collation">{{table.Meta.TABLE_COLLATION}}</span>
          <span :class="{'tip-item':true,'color-red': titleTipsRed(table.Meta.TABLE_NAME,'TABLE_COMMENT')}" title="Table comment">{{table.Meta.TABLE_COMMENT}}</span>
        </span>
      </div>
      <div class="sub-content">
        <div class="line-sept">Columns</div>
        <div v-for="(column,i) in table.Columns" :class="{'line':true,'not-exists':column.IS_PLACEHOLDER === true,'not-show':columnNotShow(table.Meta,column)}">
          <span :class="{'color-red':column.IS_ALONE}">{{column.COLUMN_NAME}}</span>
          <span class="tips">
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'COLUMN_TYPE')}" title="Column type">{{column.COLUMN_TYPE}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'IS_NULLABLE')}" title="Is nullable">{{column.IS_NULLABLE=='NO'?'Not Nullable':'Nullable'}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'COLUMN_COMMENT')}" title="Column comment">{{column.COLUMN_COMMENT}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'COLLATION_NAME')}" title="Collation name">{{column.COLLATION_NAME}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'CHARACTER_SET_NAME')}" title="Character set name">{{column.CHARACTER_SET_NAME}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'COLUMN_DEFAULT')}" title="Column default">Default:{{column.COLUMN_DEFAULT}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'DATETIME_PRECISION')}" title="Datetime precision">DP:{{column.DATETIME_PRECISION}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'NUMERIC_PRECISION')}" title="Numeric precision">NP:{{column.NUMERIC_PRECISION}}</span>
            <span :class="{'tip-item':true,'color-red': columnRed(table.Meta,column,'NUMERIC_SCALE')}" title="Numeric scale">NS:{{column.NUMERIC_SCALE}}</span>
          </span>
        </div>
        <div class="line-sept">Indexes</div>
        <div v-for="(idx,i) in table.Indexes"  :class="{'line':true,'not-exists':idx.IS_PLACEHOLDER === true,'not-show':indexNotShow(table.Meta,idx)}">
          <span :class="{'color-red':idx.IS_ALONE}">{{idx.INDEX_NAME}}</span>
          <span class="tips">
            <span :class="{'tip-item':true,'color-red': indexRed(table.Meta,idx,'INDEX_TYPE')}" title="Index type">{{idx.INDEX_TYPE}}</span>
            <span :class="{'tip-item':true,'color-red': indexRed(table.Meta,idx,'COLUMN_NAME_ALL')}" title="Columns">{{idx.COLUMN_NAME_ALL}}</span>
            <span :class="{'tip-item':true,'color-red': indexRed(table.Meta,idx,'INDEX_COMMENT')}" title="Index comment">{{idx.INDEX_COMMENT}}</span>
            <span :class="{'tip-item':true,'color-red': indexRed(table.Meta,idx,'NULLABLE')}" title="Nullable">{{idx.NULLABLE == 'YES'?'Nullable':'Not Nullable'}}</span>
            <span :class="{'tip-item':true,'color-red': indexRed(table.Meta,idx,'PACKED')}" title="Packet">{{idx.PACKED == 'YES'?'NOT PACKED':'PACKED'}}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    props: {
      tableList: {
        type: Array,
        default: []
      },
      tableCompareResult: {
        type: Object,
        default: {}
      },
      columnCompareResult: {
        type: Object,
        default: {}
      },
      indexCompareResult: {
        type: Object,
        default: {}
      },
      hideSame:{
        type:Boolean,
        default:false
      }
    },
    data () {
      return {
      }
    },
    methods: {
      titleRed (meta) {
        return (this.tableCompareResult[meta.TABLE_NAME] && this.tableCompareResult[meta.TABLE_NAME].length > 0) || meta.IS_ALONE
      },
      titleTipsRed (tableName, fieldName) {
        return this.tableCompareResult[tableName] && this.tableCompareResult[tableName].indexOf(fieldName) >= 0
      },
      columnRed (meta, column, fieldName) {
        return (this.columnCompareResult[meta.TABLE_NAME] && this.columnCompareResult[meta.TABLE_NAME][column.COLUMN_NAME] && this.columnCompareResult[meta.TABLE_NAME][column.COLUMN_NAME].indexOf(fieldName) >= 0) || column.IS_ALONE
      },

      //列是否要展示，隐藏相同项且相同的时候就不展示了
      columnNotShow(meta, column){
        return  this.hideSame && (this.columnCompareResult[meta.TABLE_NAME] && this.columnCompareResult[meta.TABLE_NAME][column.COLUMN_NAME] && this.columnCompareResult[meta.TABLE_NAME][column.COLUMN_NAME].length == 0)
      },
      indexRed (meta, idx, fieldName) {
        return (this.indexCompareResult[meta.TABLE_NAME] && this.indexCompareResult[meta.TABLE_NAME][idx.INDEX_NAME] && this.indexCompareResult[meta.TABLE_NAME][idx.INDEX_NAME].indexOf(fieldName) >= 0) || idx.IS_ALONE
      },
      //索引是否要展示，隐藏相同项且相同的时候就不展示了
      indexNotShow(meta, idx){
        return  this.hideSame && (this.indexCompareResult[meta.TABLE_NAME] && this.indexCompareResult[meta.TABLE_NAME][idx.INDEX_NAME] && this.indexCompareResult[meta.TABLE_NAME][idx.INDEX_NAME].length == 0)
      },
    }
  }
</script>

<style scoped>
  .indent{
    margin-left: 20px;
  }
  .table{
    border-bottom: 2px solid #cccccc;
  }
  .not-exists{
    color:#ffffff;
    user-select:none;
  }
  .not-show{
    display: none !important;
  }
  .not-exists .tips{
    color:#ffffff;
  }
  .not-exists .line-sept{
    color:rgba(0, 0, 0, 0.65)
  }
  .not-exists .tip-item{
    border-right: 0;
  }
  .list-container{
    background-color: #ffffff;
    margin-top:5px;
    padding:0 10px;
    width: 100%;
  }
  .line{
    height: 35px;
    line-height: 35px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
  }
  .sub-content .line{
    border-top: 1px solid #e8e8e8;
  }
  .line .title{
    font-size: 16px;
    font-weight: 700;
  }
  .line-sept{
    background-color: #e8e8e8;
    font-size: 12px;
    padding:2px 0px 2px 5px;
  }
  .tips{
    color:#999999;
  }
  .tip-item{
    padding: 0 5px;
    border-right:  1px solid #e8e8e8;;
  }
  .color-red{
    color: red;
  }
</style>
