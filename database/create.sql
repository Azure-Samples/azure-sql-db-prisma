drop table if exists dbo.[todos]; 
drop sequence if exists dbo.[globseq];
go

create sequence dbo.globseq
as int
start with 1
increment by 1
;

create table dbo.todos
(
	id int not null primary key default (next value for [globseq]),
	todo nvarchar(100) not null,
	completed tinyint not null default (0)
)
go

insert into dbo.[todos] (todo) 
values ('azure function nodejs sample')
go

create or alter procedure dbo.get_todo
@payload nvarchar(max)
as
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

create or alter procedure dbo.post_todo
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
exec dbo.[get_todo] @newPayload
go

create or alter procedure dbo.delete_todo
@payload nvarchar(max)
as
if (isjson(@payload) != 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

delete t from dbo.todos t 
where exists (select p.id from openjson(@payload) with (id int) as p where p.id = t.id)
go

create or alter procedure dbo.put_todo
@payload nvarchar(max)
as
if (isjson(@payload) != 1) begin
	throw 50000, 'Payload is not a valid JSON document', 16;
end

delete t from dbo.todos t 
where exists (select p.id from openjson(@payload) with (id int) as p where p.id = t.id)
go


create or alter procedure dbo.put_todo
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
exec dbo.[get_todo] @newPayload
go

