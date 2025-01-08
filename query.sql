-- GET ORDERLISTS
-- select * from orderlists;

-- ADD ORDERLIST
-- insert into orderlists (id, client, order_date)
-- values ( , , );

-- DELETE ORDERLIST
-- delete from orderlists where id = ;

-- EDIT ORDERLIST
-- update orderlists
-- set client = , order_date = 
-- where id = ;



-- GET ORDERPOSITIONS
-- select * from orderpositions order by orderlist_id;

-- ADD ORDERPOSITION
-- insert into orderpositions (id, amount, item_name, orderlist_id)
-- values ( , , , );

-- DELETE ORDERPOSITION
-- delete from orderpositions where id = ;

-- EDIT ORDERPOSITION
-- update orderpositions
-- set amount = , item_name = 
-- where id = ;

-- MOVE ORDERPOSITION
-- update orderpositions
-- set orderlist_id =  
-- where id = ;



-- GET ITEMS
-- select * from items;

-- EDIT ITEMS
-- update items
-- set stock =  
-- where name = ;



-- GET DATE
-- select * from appdate;

-- EDIT DATE
-- update appdate
-- set appdate = ;

-- NEXT DATE
-- update appdate set appdate = (select appdate from appdate) + interval '1 day';
-- delete from orderpositions where orderlist_id in (select id from orderlists where order_date < (select appdate from appdate));
-- delete from orderlists where order_date < (select appdate from appdate);


-- ----------------------------------------------------------
-- create role tmadmin login encrypted password 'omadmin';
-- grant select, insert, update, delete on orderlists, orderpositions, items, appdate to omadmin;