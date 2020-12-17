# Test
dfgdf



--Get the list of agents registered month wise
select DATE_TRUNC('month', created_on), count(0) as agent_count from cb_agents
group by DATE_TRUNC('month', created_on)

--total transactions done group by month, status
SELECT
       DATE_TRUNC('month', CR.created_on)
         AS  month_wise,
       COUNT(request_id) AS request_count,
	   sum(amount) as total_amount,
	   rs.name as status,
	   CR.product_id
FROM cb_requests CR inner join cb_request_status rs on CR.status_id = rs.code
GROUP BY DATE_TRUNC('month', CR.created_on), rs.name, CR.product_id;

--Get request details
select CR.request_id, amount, CR.created_on, CR.product_id, CR.status_id, CT.* from cb_requests CR 
left outer join cb_transactions CT on CR.request_id = CT.request_id
