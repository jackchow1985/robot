# -*- coding: utf-8 -*-
"""
Created on Fri Apr  1 14:26:31 2016

@author: qiangda
"""


import numpy as np
import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timedelta 
import sys
import json

def sign(x):
    return int(x>0)
    
def convertToAD(account):
    
    coll=list(db["mt4"].find({"account":account}).sort('cTime',-1).limit(1))
    
    ## trading records
    info=dict(coll[0])
    trade_raw=list(info['trades'])
    trade_rec=pd.DataFrame(trade_raw)
    currency=info['currency']
    
    ##remove the cancelled orders and sort by ticketId
    #trade_rec=trade_rec[trade_rec['commission']!='cancelled'] 
    trade_rec['profit']=map(lambda x:float(x),trade_rec['profit'])
    trade_rec['ticketId']=map(lambda x:int(x),trade_rec['ticketId'])
    
    myDf=trade_rec.sort_values(by='ticketId',ascending=1)
    myDf=myDf.reset_index()
    
    columns=['ACCOUNT_ID','USER_ID','MARKET','CASH','MARGIN','PNL','ALL_TIME_PNL','UR_PNL','CASH_DEPOSITED','ROLL_PRICE','UNIT_PRICE','ACTIVE','CREATED','CURRENCY','ON_DATE','TRADE_DATE','ON_TIME','PnLRate','5DPnLRate','MTD','QTD','YTD','OverAllPnLRate','BiggestWin','BiggestLoss','TradesCount','CloseCount','WinRatio','Ranking','RankingPer','DerbyID','CASH_AVAILABLE','MARGIN_HELD','WinTrades','WeeklyWinTrades','WeeklyBigWin','WeeklyBigLoss','WeeklyWinRatio','WeeklyClosed','WeeklySharpRatio','IdleDays','AllTimeSharpRatio','AllTimeSharpRatioByPnL']
    res=pd.DataFrame(columns=columns)   
            
    myDf['pnl']=map(lambda x,y: 0 if not np.isfinite(y) else x, myDf['profit'], myDf['openPrice'])
    myDf['close_trade']=map(lambda x,y: 0 if not np.isfinite(y) else 1, myDf['profit'], myDf['openPrice'])
    myDf['win_trade']=map(lambda x,y: 0 if not np.isfinite(y) else sign(x), myDf['profit'], myDf['openPrice'])
    myDf['cash']=map(lambda x,y: 0 if np.isfinite(y) else x, myDf['profit'], myDf['openPrice'])
    
    myDf['cashDeposit']=np.cumsum(myDf['cash'])      
     
    tempDf=myDf.reset_index()
    ##remove the non-trade rows 
    tempDf=tempDf[np.isfinite(tempDf['closePrice'])]
    tempDf=tempDf.sort_values(by=['closeTime','ticketId'],ascending=True)
    
    tempDf['allTimePnl']=np.cumsum(tempDf['pnl'])
    tempDf['closeCount']=np.cumsum(tempDf['close_trade'])
    tempDf['winTrades']=np.cumsum(tempDf['win_trade'])
    
    pnl_sum=tempDf['allTimePnl']
    cash_sum=tempDf['cashDeposit']
    tempDf['profitSum']=map(lambda x,y:x+y,pnl_sum,cash_sum)       

    ##calcupate the unit price   
   
    unit_price=[]
    biggest_win=[]
    biggest_loss=[]
    for i in range(0,len(tempDf)):
        biggest_win.append(max(list(tempDf['pnl'][0:(i+1)])+[0]))
        biggest_loss.append(min(list(tempDf['pnl'][0:(i+1)])+[0]))
        if i==0:
            last_unit_price=1

        else:
            last_unit_price=unit_price[-1]            
        unit_price.append(last_unit_price*(1+tempDf.iloc[i]['pnl']/(tempDf.iloc[i]['cashDeposit']+tempDf.iloc[i-1]['allTimePnl'])))
        
    tempDf['unitPrice']=unit_price
    tempDf['biggestWin']=biggest_win
    tempDf['biggestLoss']=biggest_loss
      
    tempDf['tradeDate']=map(lambda x: (datetime.strptime(x, "%Y.%m.%d %H:%M:%S")-timedelta(hours=6)).strftime('%Y-%m-%d'),list(tempDf['closeTime']))
    
    daily_last=tempDf.drop_duplicates('tradeDate',keep='last')
    
    res['TRADE_DATE']=daily_last['tradeDate']
    res['ON_DATE']=map(lambda x: (datetime.strptime(x, "%Y-%m-%d")+timedelta(days=1)).strftime('%Y-%m-%d'),res['TRADE_DATE'])
    res['UNIT_PRICE']=daily_last['unitPrice']
    res['ALL_TIME_PNL']=daily_last['allTimePnl']
    res['PNL']=map(lambda x: sum(tempDf[tempDf['tradeDate']==x]['pnl']),res['TRADE_DATE'])
    
    res['CloseCount']=daily_last['closeCount']
    res['WinTrades']=daily_last['winTrades']
    res['TradesCount']=map(lambda x:x*2,daily_last['closeCount'])
    res['WinRatio']=map(lambda x,y:int(100*float(x)/float(y)),daily_last['winTrades'],daily_last['closeCount'])
    
    res['BiggestWin']=daily_last['biggestWin']
    res['BiggestLoss']=daily_last['biggestLoss']
    res['CASH_DEPOSITED']=daily_last['cashDeposit']

    res['PnLRate']=map(lambda x,y: x/y*100,res['PNL'],res['CASH_DEPOSITED'])
    
    res['CASH_AVAILABLE']=daily_last['profitSum']    
    
    res['USER_ID']=[account]*len(res)
    res['MARKET']=['MT4']*len(res)
    res['CURRENCY']=[currency]*len(res)
    
    res=res.reset_index()
    
    # default code and messgae
    code=100 
    message="Success"    
    
    if tempDf['cashDeposit'].values[0]==0:
       message="Incomplete trading history, please export all your trading records from MT4"
       code=110    
    if tempDf['cashDeposit'].values[0]!=0 and len(filter(lambda x: x < 0, tempDf['profitSum'].values))>=1:
       message="Account Value less than 0"
       code=120
        
    print json.dumps({"code": code, "message": message}, sort_keys=False )
       
    return res    

def convertToCOA(account):
    coll=list(db["mt4"].find({"account":account}).sort('cTime',-1).limit(1))
    
    ## trading records
    info=coll[0]
    trade_raw=list(info['trades'])
    trade_rec=pd.DataFrame(trade_raw)   
    
    ##remove the cancelled orders and sort by ticketId
    #trade_rec=trade_rec[trade_rec['commission']!='cancelled']    
    myDf=trade_rec[np.isfinite(trade_rec['closePrice'])]     
    
    columns = ['AUDIT','OBJECT_ID','EXEC_TYPE','SYMBOL','SIDE','QUANTITY','PRICE','CUM_QTY','AVG_PX','ORDER_TYPE','ORD_STATUS','PARENT_ID','STRATEGY_ID','MODIFIED','CREATED','SEQ_ID','CLORDER_ID','SERVER_ID','TRADER','ACCOUNT','TRADE_DATE','DerbyID','ROUTE']
    res=pd.DataFrame(columns=columns)   
    
    res['EXEC_TYPE']=['FILLED']*len(myDf)*2
    res['SYMBOL']=map(lambda x: x.upper(),myDf['item'])*2
    res['SIDE']=map(lambda x: 'Buy' if x=='buy' else 'Sell',list(myDf['type']))+map(lambda x: 'Buy' if x=='sell' else 'Sell',list(myDf['type']))
        
    res['QUANTITY']=[float(x)*100000 for x in myDf['size'].tolist()]*2
    
    res['PRICE']=[0]*len(myDf)*2
    res['CUM_QTY']=[float(x)*100000 for x in myDf['size'].tolist()]*2
    
    res['AVG_PX']=list(myDf['openPrice'])+list(myDf['closePrice'])    
    res['ORDER_TYPE']=['MARKET']*len(myDf)*2
    res['ORD_STATUS']=['FILLED']*len(myDf)*2 
    res['MODIFIED']=map(lambda x: x.replace('.','-'),list(myDf['openTime']))+map(lambda x: x.replace('.','-'),list(myDf['closeTime']))
    res['CREATED']=map(lambda x: x.replace('.','-'),list(myDf['openTime']))+map(lambda x: x.replace('.','-'),list(myDf['closeTime']))
    
    res['TRADER']=[account]*len(myDf)*2
    res['ACCOUNT']=[account+'-MT4']*len(myDf)*2
    
    res['TRADE_DATE']=map(lambda x: (datetime.strptime(x, "%Y.%m.%d %H:%M:%S")-timedelta(hours=6)).strftime('%Y-%m-%d'),list(myDf['openTime']))+map(lambda x: (datetime.strptime(x, "%Y.%m.%d %H:%M:%S")-timedelta(hours=5)).strftime('%Y-%m-%d'),list(myDf['closeTime']))
    
    return res    

def convertToCP(account):
    
    coll=list(db["mt4"].find({"account":account}).sort('cTime',-1).limit(1))
    
    ## trading records
    info=coll[0]
    trade_raw=list(info['trades'])
    trade_rec=pd.DataFrame(trade_raw) 
    
    ## trading records
    info=dict(coll[0])
    trade_raw=list(info['trades'])
    trade_rec=pd.DataFrame(trade_raw)
   
    ##remove the cancelled orders and sort by ticketId
    #trade_rec=trade_rec[trade_rec['commission']!='cancelled']    
    myDf=trade_rec[np.isfinite(trade_rec['closePrice'])] 
    
    columns = ['POSITION_ID','USER_ID','ACCOUNT_ID','SYMBOL','QTY','BUY_PRICE','SELL_PRICE','PNL','AC_PNL','CREATED','TRADE_DATE','DerbyID']
    res=pd.DataFrame(columns=columns)   
    
    res['USER_ID']=[account]*len(myDf)
    res['ACCOUNT_ID']=[account+'-MT4']*len(myDf)
    res['SYMBOL']=map(lambda x: x.upper(),myDf['item'])
    res['QTY']=[float(x)*100000 for x in myDf['size'].tolist()]
    
    res['BUY_PRICE']=map(lambda x,y,z: y if x=='sell' else z, myDf['type'],myDf['closePrice'],myDf['openPrice'])
    res['SELL_PRICE']=map(lambda x,y,z: y if x=='buy' else z, myDf['type'],myDf['closePrice'],myDf['openPrice'])

    res['PNL']=map(lambda w,x,y,z: float(z)*100000*(float(x)-float(y)) if w=='buy' else float(z)*100000*(float(y)-float(x)),myDf['type'],myDf['closePrice'],myDf['openPrice'],myDf['size'])
    res['AC_PNL']=myDf['profit']
    res['CREATED']=map(lambda x: x.replace('.','-'),list(myDf['closeTime']))    
    res['TRADE_DATE']=map(lambda x: (datetime.strptime(x, "%Y.%m.%d %H:%M:%S")-timedelta(hours=6)).strftime('%Y-%m-%d'),list(myDf['closeTime']))
 
    return res                 


            
if __name__=='__main__':
    
    client = MongoClient('127.0.0.1', 7017)
    db = client.ft # use feature db
    
        
for arg in sys.argv[1:]: ## use "57281"...
    account_id=str(arg)
    # print "---------------------------------------------"
    # print "|converting for user: "+account_id+" ***"
    ## convert to accounts_daily
    # print '|converting to accounts daily...' 
    accounts_daily = convertToAD(account_id)
    accounts_daily = accounts_daily.sort_values(by='CREATED',ascending=1)

    coll_ad=db.mt4_ad
    coll_ad.delete_many({"USER_ID":account_id})
    ads = accounts_daily.to_dict('records')
    db.mt4.update_one({"account": ads[-1]["USER_ID"]}, {"$set" : {"UNIT_PRICE" : ads[-1]["UNIT_PRICE"]}})
    coll_ad.insert_many(ads)
    
    ##convert to child_order_audit
    #print '|converting to child order audit...'     
    child_order_audit = convertToCOA(account_id)
    child_order_audit = child_order_audit.sort_values(by='CREATED',ascending=1)

    coll_coa=db.mt4_coa
    coll_coa.delete_many({"TRADER":account_id})
    coll_coa.insert_many(child_order_audit.to_dict('records'))
            
    ##convert to closed_positions
    #print '|converting to closed positions...'         
    closed_positions = convertToCP(account_id)
    closed_positions = closed_positions.sort_values(by='CREATED',ascending=1)

    coll_cp=db.mt4_cp
    coll_cp.delete_many({"USER_ID":account_id})
    coll_cp.insert_many(closed_positions.to_dict('records'))   
    
    #print "---------------------------------------------"
    #print ""