create table dbo.todos
(
	id int not null identity primary key,
	todo nvarchar(100) not null,
	completed tinyint default (0)
)
go

insert into dbo.[todos] (todo) 
values ('azure function nodejs sample')
go

create or alter procedure dbo.get_todo
as
select 
	cast(
		(select
			id,
			todo as title,
			completed as completed
		from
			todos t
		for json path)
	as nvarchar(max)) as result
go

exec sp_executesql @statement=N'dbo.get_todo'
