create schema [web];
go

create user [webapp] with password = 'Super_Str0ng*P@ZZword!'
go

grant execute on schema::[web] to [webapp]
go

create sequence dbo.[global_sequence]
as int
start with 1
increment by 1;
go

create table dbo.todos
(
	id int not null primary key default (next value for [global_sequence]),
	todo nvarchar(100) not null,
	completed tinyint not null default (0)
)
go

insert into dbo.[todos] (todo) 
values ('azure function nodejs sample')
go

/*
	GET
	Accepted Input: 
	''
	'[{"id":1}, {"id":2}]'
*/
create or alter procedure [web].[get_todo]
@payload nvarchar(max) = null
as

-- return all
if (@payload = '' or @payload is null) begin
select 
	cast(
		(select
			id,
			todo as title,
			completed as completed
		from
			dbo.todos t
		for json path)
	as nvarchar(max)) as result;
	return ;
end

-- return the specified todos
if (isjson(@payload) <> 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

select 
	cast(
		(select
			id,
			todo as title,
			completed as completed
		from
			dbo.todos t
		where
			exists (select p.id from openjson(@payload) with (id int) as p where p.id = t.id)
		for json path)
	as nvarchar(max)) as result
go

/*
	POST
	Accepted Input: 
	'[{"id":1, "title":"todo title", "completed": 0}, {"id":2, "title": "another todo"}]'
*/
create or alter procedure [web].[post_todo]
@payload nvarchar(max)
as
if (isjson(@payload) != 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

declare @ids table (id int not null);

insert into dbo.todos ([todo], [completed])
output inserted.id into @ids
select [title], isnull([completed],0) from openjson(@payload) with
(
	title nvarchar(100),
	completed bit 
)

declare @newPayload as nvarchar(max) = (select id from @ids for json auto);
exec [web].[get_todo] @newPayload
go

/*
	DELETE
	Accepted Input: 
	'[{"id":1}, {"id":2}]'
*/
create or alter procedure [web].[delete_todo]
@payload nvarchar(max)
as
if (isjson(@payload) != 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

delete t from dbo.todos t 
where exists (select p.id from openjson(@payload) with (id int) as p where p.id = t.id)
go

/*
	PUT
	Accepted Input: 
	'[{"id":1, "todo":{"id": 10, "title": "updated title", "completed": 1 },{...}]'
*/
create or alter procedure [web].[put_todo]
@payload nvarchar(max)
as
if (isjson(@payload) <> 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

declare @ids table (id int not null);

with cte as
(
	select 
		id,
		new_id,
		title,
		completed
	from 
		openjson(@payload) with
		(
			id int '$.id',
			todo nvarchar(max) as json
		) 
		cross apply openjson(todo) with 
		(
			new_id int '$.id',
			title nvarchar(100),
			completed bit
		)
)
update
	t
set
	id = coalesce(c.new_id, t.id),
	todo = coalesce(c.title, t.todo),
	completed = coalesce(c.completed, t.completed)
output 
	inserted.id into @ids
from
	dbo.[todos] t
inner join
	cte c on t.id = c.id
;

declare @newPayload as nvarchar(max) = (select id from @ids for json auto);
exec [web].[get_todo] @newPayload
go