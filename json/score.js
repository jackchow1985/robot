{
	"fdt_score" : {
		"chart_name" : "FDT Score",
		"features" : [
			{
				"feature" : "riskCtrl", 
				"name" : "Risk Control(风险控制能力)"
			},
			{
				"feature" : "profitability", 
				"name" : "Profitability(盈利能力)"
			},
			{
				"feature" : "consistency", 
				"name" : "Steadiness(稳定性)"
			},
			{
				"feature" : "activity", 
				"name" : "Activeness(活跃度)"
			}
		]	
	},
	"risk_preference" :{
		"chart_name" : "Risk Preference Score",
		"features" : [
			{
				"feature": "ft_bgl",
				"name" : "Biggest Loss(最大损失)"
			}
		]
	},
	"profitability" :{
		"chart_name" : "Profitability Score",
		"features" : [
			{
				"feature": "ft_bgw",
				"name": "Biggest Profit Ratio(最大盈利比例)"
			},
			{
				"feature": "ft_roll_price",
				"name": "Roll Price(已了结净资产)"
			},
			{
				"feature": "ft_up",
				"name": "Unit Price(净资产)"
			},
			{
				"feature": "ft_streak",
				"name": "Concecutive Winning Days(连赢天数)"
			},
			{
				"feature": "ft_cp_streak",
				"name": "Concecutive Winning Positions(连赢笔数)"
			},
			{
				"feature": "ft_win_ratio",
				"name": "Win Ratio(positions)(胜率笔数)"
			},
			{
				"feature": "ft_shp_rt",
				"name": "Annual Sharpe Ratio(年化夏普比率)"
			}
		]
	}
	,
	"risk_control" :{
		"chart_name" : "Risk Control Score",
		"features" : [
			{
				"feature": "ft_var",
				"name": "Value at Risk(风险值)"
			},
			{
				"feature": "ft_mdd",
				"name": "Max Drawdown(净值最大回撤)"
			},
			{
				"feature": "ft_std_neg_pnlr",
				"name": "Std of Negative PnL Rate(损失波动)"
			},
			{
				"feature": "ft_bgl",
				"name": "Biggest Loss Ratio(最大损失比例)"
			},
			{
				"feature": "ft_tmdd",
				"name": "Timed Drawdown(最大回撤日均值)"
			},
			{
				"feature": "ft_avg_dr",
				"name": "Average Holding Period(by transaction)(平均开平仓持仓时间)"
			},
			{
				"feature": "ft_avg_ngt_op",
				"name": "Average Overnight Open Position(平均过夜仓位)"
			},
			{
				"feature": "ft_avg_max_op",
				"name": "Average Maximum Open Position(平均最大仓位)"
			}
		]
	}
	,
	"activity" :{
		"chart_name": "Activity Score",
		"features" : [
			{
				"feature": "ft_login_cnt_pday",
				"name": "Login Per Day(平均每天登陆次数)"
			},
			{
				"feature": "ft_trade_cnt_pday",
				"name": "Trades Per Day(平均每天交易次数)"
			},
			{
				"feature": "ft_login_cnt",
				"name": "Logins Count(登陆次数)"
			},
			{
				"feature": "ft_tdd",
				"name": "Trade Days Counts(交易天数)"
			},
			{
				"feature": "ft_trade_cnt",
				"name": "Trades Count(交易次数)"
			},
			{
				"feature": "ft_active_ratio",
				"name": "Active Trading Days Ratio(活跃交易天数比例)"
			},
			{
				"feature": "ft_tdlf",
				"name": "Trade Life(交易历史)"
			},
			{
				"feature": "ft_active_ratio_sldwnd",
				"name": "Active Trading Days Sliding-Window Ratio(时间窗口交易天数活跃比例)"
			}
		]
	}
	
}
